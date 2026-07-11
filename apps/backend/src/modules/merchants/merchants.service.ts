import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { MerchantStatus, Prisma } from '@prisma/client';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../database/prisma.service';
import { WalletsService } from '../wallets/wallets.service';
import { StellarService } from '../stellar/stellar.service';
import { CreateMerchantDto } from './dto/merchant.dto';

@Injectable()
export class MerchantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallets: WalletsService,
    private readonly stellar: StellarService
  ) {}

  /** Registers a merchant and provisions its payment wallet. */
  async register(userId: string, dto: CreateMerchantDto) {
    const existing = await this.prisma.merchant.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Merchant profile already exists');

    const wallet = await this.wallets.createCustodialWallet(userId, 'Merchant Wallet');

    return this.prisma.merchant.create({
      data: {
        userId,
        businessName: dto.businessName,
        tradeName: dto.tradeName,
        registrationNumber: dto.registrationNumber,
        category: dto.category,
        description: dto.description,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        barangay: dto.barangay,
        city: dto.city,
        province: dto.province,
        region: dto.region,
        postalCode: dto.postalCode,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        walletId: wallet.id,
        status: MerchantStatus.PENDING,
      },
    });
  }

  async getByUserId(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: { wallet: { select: { publicKey: true, balanceUsdc: true } } },
    });
    if (!merchant) throw new NotFoundException('Merchant profile not found');
    return merchant;
  }

  async verify(id: string) {
    const merchant = await this.prisma.merchant.findFirst({ where: { id, deletedAt: null } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return this.prisma.merchant.update({
      where: { id },
      data: { status: MerchantStatus.ACTIVE, verifiedAt: new Date() },
    });
  }

  /** Generates a payment QR code for the merchant (static or dynamic amount). */
  async generateQr(userId: string, amount?: string) {
    const merchant = await this.getByUserId(userId);
    if (!merchant.wallet) throw new BadRequestException('Merchant has no wallet');
    const uri = this.stellar.encodePaymentRequest({
      destination: merchant.wallet.publicKey,
      assetCode: 'USDC',
      amount,
      merchantId: merchant.id,
      label: merchant.businessName,
    });
    const qrCode = await QRCode.toDataURL(uri, { errorCorrectionLevel: 'M', width: 320 });
    return { uri, qrCode, merchantId: merchant.id };
  }

  async getSales(userId: string) {
    const merchant = await this.getByUserId(userId);
    const [today, week, month] = await Promise.all([
      this.sumSales(merchant.id, 1),
      this.sumSales(merchant.id, 7),
      this.sumSales(merchant.id, 30),
    ]);
    return {
      totalSales: String(merchant.totalSales),
      totalTransactions: merchant.totalTransactions,
      today,
      last7Days: week,
      last30Days: month,
    };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const merchant = await this.getByUserId(userId);
    limit = Math.min(limit, 100);
    const where: Prisma.TransactionWhereInput = { merchantId: merchant.id };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  private async sumSales(merchantId: string, days: number): Promise<string> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const agg = await this.prisma.transaction.aggregate({
      where: { merchantId, status: 'SUCCESS', createdAt: { gte: since } },
      _sum: { amount: true },
    });
    return String(agg._sum.amount ?? 0);
  }
}
