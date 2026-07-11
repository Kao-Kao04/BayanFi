import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { Keypair } from 'stellar-sdk';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto, LoginDto, WalletLoginDto } from './dto/auth.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    // Beneficiaries and merchants can self-register. Elevated roles must be
    // provisioned by an admin to prevent privilege escalation.
    const selfServiceRoles: UserRole[] = [UserRole.BENEFICIARY, UserRole.MERCHANT];
    if (!selfServiceRoles.includes(dto.role)) {
      throw new ForbiddenException('This role must be provisioned by an administrator');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const rounds = this.config.get<number>('security.bcryptRounds') ?? 10;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        phone: dto.phone,
      },
    });

    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Account lockout enforcement.
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account temporarily locked due to failed attempts');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.registerFailedAttempt(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failure counter on success.
    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    if (user.mfaEnabled) {
      const mfaToken = await this.jwt.signAsync(
        { sub: user.id, mfa: true },
        { secret: this.config.get('jwt.secret'), expiresIn: '5m' }
      );
      return { mfaRequired: true, mfaToken };
    }

    const tokens = await this.issueTokens(user, ip, userAgent);
    return { user: this.sanitize(user), ...tokens };
  }

  async walletLogin(dto: WalletLoginDto) {
    // Verify the signature over the server-issued challenge.
    const verified = this.verifyWalletSignature(dto.publicKey, dto.challenge, dto.signature);
    if (!verified) {
      throw new UnauthorizedException('Invalid wallet signature');
    }

    let user = await this.prisma.user.findUnique({
      where: { stellarPublicKey: dto.publicKey },
    });

    // First-time wallet login provisions a beneficiary account.
    if (!user) {
      user = await this.prisma.user.create({
        data: { email: `${dto.publicKey.slice(0, 8)}@wallet.bayanfi.io`, role: UserRole.BENEFICIARY, stellarPublicKey: dto.publicKey },
      });
    }

    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
    });
    if (!user) throw new UnauthorizedException('User not found');

    // Rotate: delete old session, issue new pair.
    await this.prisma.session.delete({ where: { id: session.id } });
    const tokens = await this.issueTokens(user);
    return tokens;
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.session
      .delete({ where: { refreshTokenHash: tokenHash } })
      .catch(() => undefined);
    return { success: true };
  }

  // ---------- helpers ----------

  private async issueTokens(user: User, ip?: string, userAgent?: string): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('jwt.secret'),
      expiresIn: this.config.get('jwt.expiresIn'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('jwt.refreshSecret'),
      expiresIn: this.config.get('jwt.refreshExpiresIn'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: this.hashToken(refreshToken),
        ipAddress: ip ?? null,
        userAgent: userAgent ?? null,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async registerFailedAttempt(user: User) {
    const max = this.config.get<number>('security.maxLoginAttempts') ?? 5;
    const lockoutMinutes = this.config.get<number>('security.lockoutMinutes') ?? 15;
    const attempts = user.loginAttempts + 1;
    const shouldLock = attempts >= max;
    const lockedUntil = shouldLock
      ? new Date(Date.now() + lockoutMinutes * 60_000)
      : null;
    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: attempts, lockedUntil },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private verifyWalletSignature(publicKey: string, challenge: string, signature: string): boolean {
    try {
      const keypair = Keypair.fromPublicKey(publicKey);
      return keypair.verify(Buffer.from(challenge), Buffer.from(signature, 'base64'));
    } catch {
      return false;
    }
  }

  /** Generates a random challenge for wallet-based authentication. */
  generateChallenge(): string {
    return `BayanFi login: ${randomBytes(16).toString('hex')}`;
  }

  private sanitize(user: User) {
    const { passwordHash, mfaSecret, ...safe } = user;
    return safe;
  }
}
