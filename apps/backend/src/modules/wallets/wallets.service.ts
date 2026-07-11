import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalletType, WalletStatus } from '@prisma/client';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../database/prisma.service';
import { StellarService } from '../stellar/stellar.service';
import { CryptoUtil } from '../../common/utils/crypto.util';

/**
 * Manages Stellar wallets for users. Custodial wallets have their secret
 * keys encrypted at rest; non-custodial wallets store only the public key.
 */
@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stellar: StellarService,
    private readonly config: ConfigService
  ) {}

  private get encryptionKey(): string {
    const key = this.config.get<string>('security.encryptionKey');
    if (!key) throw new Error('ENCRYPTION_KEY is not configured');
    return key;
  }

  /**
   * Creates a custodial wallet for a user: generates a keypair, provisions
   * the account on-chain, establishes a USDC trustline, and persists the
   * encrypted secret.
   */
  async createCustodialWallet(userId: string, label?: string) {
    const existing = await this.prisma.wallet.findFirst({
      where: { userId, isPrimary: true, deletedAt: null },
    });
    if (existing) return this.toPublicWallet(existing);

    const { publicKey, secretKey } = this.stellar.generateKeypair();

    // Onboard with SPONSORED RESERVES: the platform master account pays all
    // reserves in a single transaction, so the beneficiary needs 0 XLM and
    // gets a USDC trustline immediately. This is how BayanFi onboards the
    // unbanked for free — a Stellar-native capability, not a workaround.
    await this.stellar.onboardSponsoredWallet(secretKey, 'USDC');

    const encryptedSecretKey = CryptoUtil.encrypt(secretKey, this.encryptionKey);

    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        publicKey,
        encryptedSecretKey,
        walletType: WalletType.CUSTODIAL,
        isPrimary: true,
        label: label ?? 'Primary Wallet',
        isFunded: true,
      },
    });

    // Persist public key on the user for wallet-based auth.
    await this.prisma.user.update({
      where: { id: userId },
      data: { stellarPublicKey: publicKey },
    });

    this.logger.log(`Created custodial wallet ${publicKey} for user ${userId}`);
    return this.toPublicWallet(wallet);
  }

  /** Connects an external (non-custodial) wallet by public key. */
  async connectExternalWallet(userId: string, publicKey: string, label?: string) {
    if (!this.stellar.isValidPublicKey(publicKey)) {
      throw new ForbiddenException('Invalid Stellar public key');
    }
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        publicKey,
        walletType: WalletType.NON_CUSTODIAL,
        isPrimary: false,
        label: label ?? 'External Wallet',
      },
    });
    return this.toPublicWallet(wallet);
  }

  async listUserWallets(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId, deletedAt: null },
      orderBy: { isPrimary: 'desc' },
    });
    return wallets.map((w) => this.toPublicWallet(w));
  }

  /** Returns the live on-chain balance for a wallet, refreshing the cache. */
  async getBalance(walletId: string, userId: string) {
    const wallet = await this.getOwnedWallet(walletId, userId);
    const balances = await this.stellar.getBalances(wallet.publicKey);

    const xlm = balances.find((b) => b.asset === 'XLM')?.balance ?? '0';
    const usdc = balances.find((b) => b.asset === 'USDC')?.balance ?? '0';

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balanceXlm: xlm,
        balanceUsdc: usdc,
        balances: balances as unknown as object,
        lastSyncedAt: new Date(),
      },
    });

    return { publicKey: wallet.publicKey, balances, lastSyncedAt: new Date().toISOString() };
  }

  /** Generates a QR code (data URL) for receiving payments to this wallet. */
  async generateReceiveQr(walletId: string, userId: string, amount?: string) {
    const wallet = await this.getOwnedWallet(walletId, userId);
    const uri = this.stellar.encodePaymentRequest({
      destination: wallet.publicKey,
      assetCode: 'USDC',
      amount,
      label: 'BayanFi payment',
    });
    const dataUrl = await QRCode.toDataURL(uri, { errorCorrectionLevel: 'M', width: 320 });
    return { uri, qrCode: dataUrl };
  }

  /**
   * Internal: returns the decrypted secret key for a custodial wallet.
   * Only callable by trusted services (TransactionsService, disbursement).
   */
  async getDecryptedSecret(walletId: string): Promise<string> {
    const wallet = await this.prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.walletType !== WalletType.CUSTODIAL || !wallet.encryptedSecretKey) {
      throw new ForbiddenException('Wallet is non-custodial; secret not available');
    }
    return CryptoUtil.decrypt(wallet.encryptedSecretKey, this.encryptionKey);
  }

  async getWalletByUserId(userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { userId, isPrimary: true, deletedAt: null },
    });
    if (!wallet) throw new NotFoundException('No primary wallet for user');
    return wallet;
  }

  private async getOwnedWallet(walletId: string, userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, deletedAt: null },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.userId !== userId) {
      throw new ForbiddenException('You do not own this wallet');
    }
    return wallet;
  }

  private toPublicWallet(wallet: {
    id: string;
    userId: string;
    publicKey: string;
    walletType: WalletType;
    isPrimary: boolean;
    label: string | null;
    balanceXlm: unknown;
    balanceUsdc: unknown;
    isFunded: boolean;
    status: WalletStatus;
    createdAt: Date;
  }) {
    return {
      id: wallet.id,
      userId: wallet.userId,
      publicKey: wallet.publicKey,
      walletType: wallet.walletType,
      isPrimary: wallet.isPrimary,
      label: wallet.label,
      balanceXlm: String(wallet.balanceXlm),
      balanceUsdc: String(wallet.balanceUsdc),
      isFunded: wallet.isFunded,
      status: wallet.status,
      createdAt: wallet.createdAt,
    };
  }
}
