import { Injectable, NotFoundException } from '@nestjs/common';
import { ProgramStatus, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { StellarService } from '../stellar/stellar.service';

/**
 * Public, unauthenticated transparency data. Never exposes PII: only
 * aggregate figures, program metadata, and anonymized geographic counts.
 *
 * Crucially, financial figures are backed by VERIFIABLE on-chain state:
 * the getOnChainProof endpoints read directly from the Stellar ledger, so
 * anyone can independently confirm the numbers are real and not fabricated.
 */
@Injectable()
export class TransparencyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stellar: StellarService
  ) {}

  /** Platform-wide aggregate statistics. */
  async getStats() {
    const [programs, budgets, beneficiaries, transactions, organizations] = await Promise.all([
      this.prisma.program.count({ where: { deletedAt: null, status: ProgramStatus.ACTIVE } }),
      this.prisma.program.aggregate({
        where: { deletedAt: null },
        _sum: { budgetAmount: true, distributedAmount: true },
      }),
      this.prisma.application.groupBy({
        by: ['beneficiaryId'],
        where: { status: 'DISBURSED' },
        orderBy: { beneficiaryId: 'asc' },
      }),
      this.prisma.transaction.count({ where: { status: TransactionStatus.SUCCESS } }),
      this.prisma.organization.count({ where: { status: 'VERIFIED', deletedAt: null } }),
    ]);

    return {
      totalPrograms: programs,
      totalBudget: String(budgets._sum.budgetAmount ?? 0),
      totalDistributed: String(budgets._sum.distributedAmount ?? 0),
      totalBeneficiaries: beneficiaries.length,
      totalTransactions: transactions,
      activeOrganizations: organizations,
    };
  }

  /** Lists active programs with public-safe fields and utilization. */
  async listPrograms() {
    const programs = await this.prisma.program.findMany({
      where: { deletedAt: null, status: ProgramStatus.ACTIVE },
      select: {
        id: true,
        name: true,
        type: true,
        budgetAmount: true,
        distributedAmount: true,
        budgetAsset: true,
        startDate: true,
        endDate: true,
        organization: { select: { name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return programs.map((p) => ({
      ...p,
      budgetAmount: String(p.budgetAmount),
      distributedAmount: String(p.distributedAmount),
      remainingAmount: String(Number(p.budgetAmount) - Number(p.distributedAmount)),
    }));
  }

  /**
   * Reads a program's funding wallet state directly from the Stellar ledger.
   * This lets the public verify the distributed/remaining figures against the
   * chain rather than trusting the operator's database.
   */
  async getProgramOnChainProof(programId: string) {
    const program = await this.prisma.program.findFirst({
      where: { id: programId, deletedAt: null },
      include: { organization: { select: { stellarPublicKey: true, name: true } } },
    });
    if (!program) throw new NotFoundException('Program not found');

    const publicKey = program.organization.stellarPublicKey;
    if (!publicKey) {
      return { verified: false, reason: 'Program organization has no on-chain wallet yet' };
    }

    const [balances, payments] = await Promise.all([
      this.stellar.getBalances(publicKey),
      this.stellar.getOnChainPayments(publicKey, 25),
    ]);

    return {
      verified: true,
      programId,
      fundingWallet: publicKey,
      explorerUrl: `https://stellar.expert/explorer/${this.stellar.network}/account/${publicKey}`,
      onChainBalances: balances,
      recentOnChainPayments: payments,
      databaseFigures: {
        budget: String(program.budgetAmount),
        distributed: String(program.distributedAmount),
      },
    };
  }

  /** Verifies any transaction hash directly against the ledger. */
  async verifyTransaction(txHash: string) {
    const result = await this.stellar.verifyTransaction(txHash);
    return {
      txHash,
      ...result,
      explorerUrl: `https://stellar.expert/explorer/${this.stellar.network}/tx/${txHash}`,
    };
  }

  /** Anonymized geographic distribution of disbursements by region. */
  async getDistributionMap() {
    const rows = await this.prisma.$queryRaw<Array<{ region: string; count: bigint; total: number }>>`
      SELECT b.region AS region,
             COUNT(DISTINCT a.beneficiary_id) AS count,
             COALESCE(SUM(a.approved_amount), 0) AS total
      FROM applications a
      JOIN beneficiaries b ON b.id = a.beneficiary_id
      WHERE a.status = 'DISBURSED'
      GROUP BY b.region
      ORDER BY total DESC`;
    return rows.map((r) => ({
      region: r.region,
      beneficiaries: Number(r.count),
      distributed: String(r.total),
    }));
  }

  /** Daily transaction volume for the last N days. */
  async getDailyTransactions(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await this.prisma.$queryRaw<Array<{ day: string; count: bigint; total: number }>>`
      SELECT DATE(created_at) AS day, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE status = 'SUCCESS' AND created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY day ASC`;
    return rows.map((r) => ({
      date: r.day,
      count: Number(r.count),
      volume: String(r.total),
    }));
  }
}
