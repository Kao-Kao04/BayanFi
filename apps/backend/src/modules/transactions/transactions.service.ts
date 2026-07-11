import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { TransactionType, TransactionStatus, MerchantCategory } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { StellarService } from '../stellar/stellar.service';
import { WalletsService } from '../wallets/wallets.service';

interface DisburseParams {
  applicationId: string;
  programId: string;
  toWalletId: string;
  amount: number;
  assetCode: string;
  assetIssuer?: string;
  memo?: string;
}

/**
 * Handles all value movement: program disbursements and merchant payments.
 * Persists a Transaction record for every on-chain operation and enforces
 * spending restrictions before submitting to Stellar.
 */
@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stellar: StellarService,
    private readonly wallets: WalletsService
  ) {}

  /**
   * Disburses funds from a program's organization wallet to a beneficiary.
   * Called by ApplicationsService after approval. Budget must already be
   * reserved within the same DB transaction by the caller.
   */
  async disburse(params: DisburseParams, orgWalletId: string) {
    const toWallet = await this.prisma.wallet.findUnique({ where: { id: params.toWalletId } });
    if (!toWallet) throw new NotFoundException('Destination wallet not found');

    // Ensure the beneficiary has a trustline to receive the asset.
    const beneficiarySecret = await this.wallets.getDecryptedSecret(params.toWalletId);
    await this.stellar.ensureTrustline(beneficiarySecret, params.assetCode, params.assetIssuer);

    const sourceSecret = await this.wallets.getDecryptedSecret(orgWalletId);

    // Create a PENDING record first for traceability.
    const pending = await this.prisma.transaction.create({
      data: {
        fromWalletId: orgWalletId,
        toWalletId: params.toWalletId,
        programId: params.programId,
        applicationId: params.applicationId,
        transactionType: TransactionType.DISBURSEMENT,
        amount: params.amount,
        assetCode: params.assetCode,
        assetIssuer: params.assetIssuer,
        stellarTxHash: `pending-${params.applicationId}`,
        status: TransactionStatus.PENDING,
      },
    });

    try {
      const result = await this.stellar.sendPayment({
        sourceSecret,
        destination: toWallet.publicKey,
        amount: String(params.amount),
        assetCode: params.assetCode,
        assetIssuer: params.assetIssuer,
        memo: params.memo ?? 'BayanFi disbursement',
      });

      return this.prisma.transaction.update({
        where: { id: pending.id },
        data: {
          stellarTxHash: result.hash,
          stellarLedger: result.ledger,
          status: TransactionStatus.SUCCESS,
        },
      });
    } catch (err) {
      this.logger.error(`Disbursement failed for application ${params.applicationId}`, err as Error);
      await this.prisma.transaction.update({
        where: { id: pending.id },
        data: { status: TransactionStatus.FAILED, failureReason: (err as Error).message },
      });
      throw new BadRequestException('Disbursement failed on the Stellar network');
    }
  }

  /**
   * Beneficiary pays a merchant. Enforces the funding program's spending
   * restrictions (allowed categories, limits) before submitting.
   */
  async payMerchant(params: {
    beneficiaryUserId: string;
    merchantId: string;
    amount: number;
    assetCode: string;
    memo?: string;
  }) {
    const merchant = await this.prisma.merchant.findFirst({
      where: { id: params.merchantId, deletedAt: null },
    });
    if (!merchant) throw new NotFoundException('Merchant not found');
    if (merchant.status !== 'ACTIVE' && merchant.status !== 'VERIFIED') {
      throw new BadRequestException('Merchant is not active');
    }
    if (!merchant.walletId) throw new BadRequestException('Merchant has no payment wallet');

    const fromWallet = await this.wallets.getWalletByUserId(params.beneficiaryUserId);
    const merchantWallet = await this.prisma.wallet.findUnique({ where: { id: merchant.walletId } });
    if (!merchantWallet) throw new NotFoundException('Merchant wallet not found');

    // Enforce spending restrictions derived from the beneficiary's programs.
    await this.enforceSpendingRestrictions(params.beneficiaryUserId, merchant.category, params.amount);

    const sourceSecret = await this.wallets.getDecryptedSecret(fromWallet.id);

    const pending = await this.prisma.transaction.create({
      data: {
        fromWalletId: fromWallet.id,
        toWalletId: merchantWallet.id,
        merchantId: merchant.id,
        transactionType: TransactionType.PAYMENT,
        amount: params.amount,
        assetCode: params.assetCode,
        stellarTxHash: `pending-pay-${Date.now()}`,
        status: TransactionStatus.PENDING,
      },
    });

    try {
      const result = await this.stellar.sendPayment({
        sourceSecret,
        destination: merchantWallet.publicKey,
        amount: String(params.amount),
        assetCode: params.assetCode,
        memo: params.memo ?? 'BayanFi payment',
      });

      const [txn] = await this.prisma.$transaction([
        this.prisma.transaction.update({
          where: { id: pending.id },
          data: {
            stellarTxHash: result.hash,
            stellarLedger: result.ledger,
            status: TransactionStatus.SUCCESS,
          },
        }),
        this.prisma.merchant.update({
          where: { id: merchant.id },
          data: {
            totalSales: { increment: params.amount },
            totalTransactions: { increment: 1 },
          },
        }),
      ]);
      return { ...txn, explorerUrl: this.stellar.explorerUrl(result.hash) };
    } catch (err) {
      await this.prisma.transaction.update({
        where: { id: pending.id },
        data: { status: TransactionStatus.FAILED, failureReason: (err as Error).message },
      });
      throw new BadRequestException('Payment failed on the Stellar network');
    }
  }

  async findById(id: string, requesterUserId: string, isAuditor: boolean) {
    const txn = await this.prisma.transaction.findUnique({
      where: { id },
      include: { fromWallet: true, toWallet: true },
    });
    if (!txn) throw new NotFoundException('Transaction not found');
    if (!isAuditor && txn.fromWallet.userId !== requesterUserId && txn.toWallet.userId !== requesterUserId) {
      throw new ForbiddenException('You cannot view this transaction');
    }
    return { ...txn, explorerUrl: this.stellar.explorerUrl(txn.stellarTxHash) };
  }

  async getProof(id: string) {
    const txn = await this.prisma.transaction.findUnique({ where: { id } });
    if (!txn) throw new NotFoundException('Transaction not found');
    return {
      stellarTxHash: txn.stellarTxHash,
      explorerUrl: this.stellar.explorerUrl(txn.stellarTxHash),
      status: txn.status,
      amount: String(txn.amount),
      assetCode: txn.assetCode,
    };
  }

  /**
   * Enforces that a payment is allowed under the spending restrictions of
   * the beneficiary's active disbursing programs (merchant category + limits).
   */
  private async enforceSpendingRestrictions(
    beneficiaryUserId: string,
    category: MerchantCategory,
    amount: number
  ) {
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { userId: beneficiaryUserId },
      include: {
        applications: {
          where: { status: 'DISBURSED' },
          include: { program: true },
        },
      },
    });
    if (!beneficiary) return; // No profile means no program-scoped restrictions.

    for (const app of beneficiary.applications) {
      const restrictions = (app.program.spendingRestrictions ?? {}) as {
        allowedCategories?: string[];
        transactionLimit?: number;
      };
      if (
        restrictions.allowedCategories &&
        restrictions.allowedCategories.length > 0 &&
        !restrictions.allowedCategories.includes(category)
      ) {
        throw new ForbiddenException(
          `Program funds cannot be spent at ${category} merchants`
        );
      }
      if (restrictions.transactionLimit && amount > restrictions.transactionLimit) {
        throw new ForbiddenException(
          `Transaction exceeds the per-payment limit of ${restrictions.transactionLimit}`
        );
      }
    }
  }
}
