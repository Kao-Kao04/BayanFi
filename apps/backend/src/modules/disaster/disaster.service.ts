import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { WalletsService } from '../wallets/wallets.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ProgramsService } from '../programs/programs.service';
import { NotificationsService } from '../notifications/notifications.service';

interface EmergencyReleaseParams {
  programId: string;
  region: string;
  amountPerRecipient: number;
  assetCode?: string;
}

/**
 * Disaster Mode: rapid, bulk fund release to all verified beneficiaries in a
 * target region, bypassing the standard application review workflow. Every
 * disbursement is still recorded on-chain and fully auditable.
 */
@Injectable()
export class DisasterService {
  private readonly logger = new Logger(DisasterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wallets: WalletsService,
    private readonly transactions: TransactionsService,
    private readonly programs: ProgramsService,
    private readonly notifications: NotificationsService
  ) {}

  /** Lists regions with counts of verified beneficiaries eligible for relief. */
  async getRegions() {
    const rows = await this.prisma.beneficiary.groupBy({
      by: ['region'],
      where: { deletedAt: null, status: 'ACTIVE' },
      _count: { _all: true },
      orderBy: { region: 'asc' },
    });
    return rows.map((r) => ({ region: r.region, beneficiaries: r._count._all }));
  }

  /**
   * Executes an emergency release. Selects all active beneficiaries in the
   * region, disburses to each, and notifies them. Uses the program's org
   * funding wallet. Returns a summary of successes and failures.
   */
  async emergencyRelease(params: EmergencyReleaseParams, initiatorId: string) {
    const program = await this.programs.findById(params.programId);
    if (!program.isEmergency) {
      throw new BadRequestException('Program is not configured for emergency releases');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: program.organizationId },
    });
    if (!org?.stellarPublicKey) throw new BadRequestException('Organization has no funding wallet');
    const orgWallet = await this.prisma.wallet.findFirst({
      where: { publicKey: org.stellarPublicKey },
    });
    if (!orgWallet) throw new BadRequestException('Organization wallet not managed by BayanFi');

    const recipients = await this.prisma.beneficiary.findMany({
      where: { region: params.region, status: 'ACTIVE', deletedAt: null },
      include: { user: true },
    });

    if (recipients.length === 0) {
      throw new NotFoundException('No eligible beneficiaries in the selected region');
    }

    const totalRequired = recipients.length * params.amountPerRecipient;
    const remaining = Number(program.budgetAmount) - Number(program.distributedAmount);
    if (totalRequired > remaining) {
      throw new BadRequestException(
        `Insufficient budget: need ${totalRequired}, have ${remaining} remaining`
      );
    }

    const assetCode = params.assetCode ?? program.budgetAsset;
    let sent = 0;
    const failures: Array<{ beneficiaryId: string; reason: string }> = [];

    // Process recipients in parallel batches instead of one-by-one, so a
    // release to thousands of people completes in seconds, not minutes.
    const BATCH_SIZE = 8;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((b) =>
          this.disburseToRecipient(b, program, orgWallet.id, params, assetCode, initiatorId)
        )
      );
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          sent += 1;
        } else {
          failures.push({ beneficiaryId: batch[idx].id, reason: String(r.reason?.message ?? r.reason) });
        }
      });
    }

    return {
      region: params.region,
      totalRecipients: recipients.length,
      sent,
      failed: failures.length,
      failures,
      amountPerRecipient: params.amountPerRecipient,
      assetCode,
    };
  }

  /** Disburses emergency relief to a single recipient (used by batched release). */
  private async disburseToRecipient(
    beneficiary: { id: string; userId: string },
    program: { id: string; budgetAsset: string },
    orgWalletId: string,
    params: EmergencyReleaseParams,
    assetCode: string,
    initiatorId: string
  ): Promise<void> {
    // Ensure beneficiary wallet exists (sponsored — recipient needs no XLM).
    let wallet = await this.prisma.wallet.findFirst({
      where: { userId: beneficiary.userId, isPrimary: true, deletedAt: null },
    });
    if (!wallet) {
      const created = await this.wallets.createCustodialWallet(beneficiary.userId);
      wallet = await this.prisma.wallet.findUnique({ where: { id: created.id } });
    }

    const application = await this.prisma.application.create({
      data: {
        programId: program.id,
        beneficiaryId: beneficiary.id,
        status: ApplicationStatus.APPROVED,
        approvedAmount: params.amountPerRecipient,
        approvedAt: new Date(),
        purpose: `Emergency relief: ${params.region}`,
        metadata: { emergencyRelease: true, initiatedBy: initiatorId } as Prisma.InputJsonValue,
      },
    });

    await this.prisma.$transaction(async (tx) => {
      await this.programs.reserveBudget(program.id, params.amountPerRecipient, tx);
    });

    const txn = await this.transactions.disburse(
      {
        applicationId: application.id,
        programId: program.id,
        toWalletId: wallet!.id,
        amount: params.amountPerRecipient,
        assetCode,
        memo: 'Emergency relief',
      },
      orgWalletId
    );

    await this.prisma.application.update({
      where: { id: application.id },
      data: {
        status: ApplicationStatus.DISBURSED,
        disbursedAt: new Date(),
        disbursementTxHash: txn.stellarTxHash,
      },
    });

    await this.notifications.create({
      userId: beneficiary.userId,
      type: 'DISBURSEMENT',
      title: 'Emergency Relief Received',
      message: `You have received ${params.amountPerRecipient} ${assetCode} in emergency assistance.`,
      priority: 'URGENT',
    });
  }
}
