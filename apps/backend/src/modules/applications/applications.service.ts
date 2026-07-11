import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ApplicationStatus, ApprovalWorkflow, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ProgramsService } from '../programs/programs.service';
import { WalletsService } from '../wallets/wallets.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AiService } from '../ai/ai.service';
import { CreateApplicationDto, ReviewApplicationDto, ApproveApplicationDto } from './dto/application.dto';

/**
 * Orchestrates the application lifecycle:
 * DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> DISBURSED (or REJECTED).
 * Runs AI risk checks on submit and triggers on-chain disbursement on approval.
 */
@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly programs: ProgramsService,
    private readonly wallets: WalletsService,
    private readonly transactions: TransactionsService,
    private readonly ai: AiService
  ) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const beneficiary = await this.prisma.beneficiary.findUnique({ where: { userId } });
    if (!beneficiary) {
      throw new BadRequestException('Complete your beneficiary profile before applying');
    }

    const program = await this.programs.findById(dto.programId);
    if (program.status !== 'ACTIVE') {
      throw new BadRequestException('This program is not accepting applications');
    }

    // Prevent duplicate active applications to the same program.
    const existing = await this.prisma.application.findFirst({
      where: {
        programId: dto.programId,
        beneficiaryId: beneficiary.id,
        status: { notIn: [ApplicationStatus.CANCELLED, ApplicationStatus.REJECTED] },
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException('You already have an application for this program');
    }

    return this.prisma.application.create({
      data: {
        programId: dto.programId,
        beneficiaryId: beneficiary.id,
        requestedAmount: dto.requestedAmount,
        purpose: dto.purpose,
        status: ApplicationStatus.DRAFT,
      },
    });
  }

  async listForUser(userId: string) {
    const beneficiary = await this.prisma.beneficiary.findUnique({ where: { userId } });
    if (!beneficiary) return [];
    return this.prisma.application.findMany({
      where: { beneficiaryId: beneficiary.id, deletedAt: null },
      include: { program: { select: { name: true, type: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, deletedAt: null },
      include: { program: true, beneficiary: true, documents: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  /**
   * Submits an application for review. Runs AI duplicate + fraud + eligibility
   * checks, stores scores, and auto-approves if the program allows it and the
   * risk is low.
   */
  async submit(id: string, userId: string) {
    const app = await this.findById(id);
    await this.assertOwner(app, userId);
    if (app.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException('Only draft applications can be submitted');
    }

    // Run AI analysis (duplicate, fraud, eligibility). Failures are non-fatal:
    // the application still submits but is flagged for manual review.
    const analysis = await this.ai
      .analyzeApplication({
        applicationId: app.id,
        beneficiary: app.beneficiary,
        program: app.program,
      })
      .catch((err) => {
        this.logger.warn(`AI analysis failed for ${app.id}: ${err.message}`);
        return null;
      });

    const riskScore = analysis?.riskScore ?? 50;
    const eligibilityScore = analysis?.eligibilityScore ?? 50;
    const flags = analysis?.flags ?? [];
    const duplicatePassed = analysis?.duplicateCheckPassed ?? null;
    const fraudPassed = analysis?.fraudCheckPassed ?? null;

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.SUBMITTED,
        submittedAt: new Date(),
        riskScore,
        eligibilityScore,
        flags: flags as Prisma.InputJsonValue,
        duplicateCheckPassed: duplicatePassed,
        fraudCheckPassed: fraudPassed,
      },
    });

    // Auto-approval path for low-risk applications when configured.
    const lowRisk = riskScore < 30 && duplicatePassed !== false && fraudPassed !== false;
    if (app.program.approvalWorkflow === ApprovalWorkflow.AUTOMATIC && lowRisk) {
      return this.approve(id, userId, { approvedAmount: Number(app.requestedAmount ?? app.program.maxAmountPerBeneficiary ?? 0) }, true);
    }

    return updated;
  }

  async review(id: string, reviewerId: string, dto: ReviewApplicationDto) {
    const app = await this.findById(id);
    if (app.status !== ApplicationStatus.SUBMITTED && app.status !== ApplicationStatus.UNDER_REVIEW) {
      throw new BadRequestException('Application is not in a reviewable state');
    }
    return this.prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.UNDER_REVIEW,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        metadata: { reviewNote: dto.note } as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Approves an application and disburses funds on-chain within a DB
   * transaction that reserves the program budget atomically.
   */
  async approve(id: string, approverId: string, dto: ApproveApplicationDto, systemApproved = false) {
    const app = await this.findById(id);
    if ([ApplicationStatus.DISBURSED, ApplicationStatus.APPROVED].includes(app.status as any)) {
      throw new BadRequestException('Application is already approved');
    }

    const program = app.program;
    const amount = dto.approvedAmount;
    const maxPer = program.maxAmountPerBeneficiary ? Number(program.maxAmountPerBeneficiary) : null;
    if (maxPer && amount > maxPer) {
      throw new BadRequestException(`Approved amount exceeds the program maximum of ${maxPer}`);
    }

    // Resolve wallets: organization funding wallet and beneficiary wallet.
    const org = await this.prisma.organization.findUnique({ where: { id: program.organizationId } });
    if (!org?.stellarPublicKey) {
      throw new BadRequestException('Organization has no funding wallet');
    }
    const orgWallet = await this.prisma.wallet.findFirst({
      where: { publicKey: org.stellarPublicKey },
    });
    if (!orgWallet) {
      throw new BadRequestException('Organization funding wallet is not managed by BayanFi');
    }

    // Ensure the beneficiary has a wallet; create one if missing.
    let beneficiaryWallet = await this.prisma.wallet.findFirst({
      where: { userId: app.beneficiary.userId, isPrimary: true, deletedAt: null },
    });
    if (!beneficiaryWallet) {
      const created = await this.wallets.createCustodialWallet(app.beneficiary.userId);
      beneficiaryWallet = await this.prisma.wallet.findUnique({ where: { id: created.id } });
    }

    // Reserve budget atomically, then mark approved.
    await this.prisma.$transaction(async (tx) => {
      await this.programs.reserveBudget(program.id, amount, tx);
      await tx.application.update({
        where: { id },
        data: {
          status: ApplicationStatus.APPROVED,
          approvedAmount: amount,
          approvedById: systemApproved ? null : approverId,
          approvedAt: new Date(),
        },
      });
    });

    // Disburse on-chain (outside the DB transaction; network I/O).
    const txn = await this.transactions.disburse(
      {
        applicationId: app.id,
        programId: program.id,
        toWalletId: beneficiaryWallet!.id,
        amount,
        assetCode: program.budgetAsset,
        memo: `${program.name.slice(0, 20)}`,
      },
      orgWallet.id
    );

    const disbursed = await this.prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.DISBURSED,
        disbursedAt: new Date(),
        disbursementTxHash: txn.stellarTxHash,
      },
    });

    return { application: disbursed, transaction: txn };
  }

  async reject(id: string, reviewerId: string, reason: string) {
    const app = await this.findById(id);
    if (app.status === ApplicationStatus.DISBURSED) {
      throw new BadRequestException('Cannot reject a disbursed application');
    }
    return this.prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.REJECTED,
        rejectionReason: reason,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
    });
  }

  async cancel(id: string, userId: string) {
    const app = await this.findById(id);
    await this.assertOwner(app, userId);
    if (![ApplicationStatus.DRAFT, ApplicationStatus.SUBMITTED].includes(app.status as any)) {
      throw new BadRequestException('Only draft or submitted applications can be cancelled');
    }
    return this.prisma.application.update({
      where: { id },
      data: { status: ApplicationStatus.CANCELLED },
    });
  }

  private async assertOwner(app: { beneficiary: { userId: string } }, userId: string) {
    if (app.beneficiary.userId !== userId) {
      throw new ForbiddenException('You do not own this application');
    }
  }
}
