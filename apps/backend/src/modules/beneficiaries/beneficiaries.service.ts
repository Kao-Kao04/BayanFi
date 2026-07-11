import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { CreateBeneficiaryDto, UpdateBeneficiaryDto } from './dto/beneficiary.dto';

@Injectable()
export class BeneficiariesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  private get encryptionKey(): string {
    const key = this.config.get<string>('security.encryptionKey');
    if (!key) throw new Error('ENCRYPTION_KEY not configured');
    return key;
  }

  async createProfile(userId: string, dto: CreateBeneficiaryDto) {
    const existing = await this.prisma.beneficiary.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Beneficiary profile already exists');

    // National ID is PII: encrypt at rest.
    const encryptedNationalId = dto.nationalId
      ? CryptoUtil.encrypt(dto.nationalId, this.encryptionKey)
      : undefined;

    const isSenior = this.computeIsSenior(dto.dateOfBirth);

    return this.prisma.beneficiary.create({
      data: {
        userId,
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        suffix: dto.suffix,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        civilStatus: dto.civilStatus,
        nationalId: encryptedNationalId,
        nationalIdType: dto.nationalIdType,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        barangay: dto.barangay,
        city: dto.city,
        province: dto.province,
        region: dto.region,
        postalCode: dto.postalCode,
        isPwd: dto.isPwd ?? false,
        isSenior,
        isIndigenous: dto.isIndigenous ?? false,
        householdSize: dto.householdSize,
        monthlyIncome: dto.monthlyIncome,
        occupation: dto.occupation,
      },
    });
  }

  async getByUserId(userId: string) {
    const beneficiary = await this.prisma.beneficiary.findUnique({ where: { userId } });
    if (!beneficiary) throw new NotFoundException('Beneficiary profile not found');
    return this.maskPii(beneficiary);
  }

  async getById(id: string) {
    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: { id, deletedAt: null },
    });
    if (!beneficiary) throw new NotFoundException('Beneficiary not found');
    return this.maskPii(beneficiary);
  }

  async update(userId: string, dto: UpdateBeneficiaryDto) {
    const beneficiary = await this.prisma.beneficiary.findUnique({ where: { userId } });
    if (!beneficiary) throw new NotFoundException('Beneficiary profile not found');
    const { dateOfBirth, nationalId, ...rest } = dto;
    return this.prisma.beneficiary.update({
      where: { userId },
      data: {
        ...rest,
        ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth), isSenior: this.computeIsSenior(dateOfBirth) } : {}),
        ...(nationalId ? { nationalId: CryptoUtil.encrypt(nationalId, this.encryptionKey) } : {}),
      },
    });
  }

  async search(params: { page?: number; limit?: number; region?: string; query?: string }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const where: Prisma.BeneficiaryWhereInput = {
      deletedAt: null,
      ...(params.region ? { region: params.region } : {}),
      ...(params.query
        ? {
            OR: [
              { firstName: { contains: params.query, mode: 'insensitive' } },
              { lastName: { contains: params.query, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.beneficiary.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.beneficiary.count({ where }),
    ]);
    return {
      data: items.map((b) => this.maskPii(b)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private computeIsSenior(dob: string): boolean {
    const age = (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000);
    return age >= 60;
  }

  /** Returns a masked national ID (never expose raw PII in responses). */
  private maskPii<T extends { nationalId: string | null }>(beneficiary: T) {
    return { ...beneficiary, nationalId: beneficiary.nationalId ? '****ENCRYPTED****' : null };
  }
}
