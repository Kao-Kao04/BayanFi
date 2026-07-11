import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ProgramStatus,
  OrganizationMemberRole,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateProgramDto, UpdateProgramDto } from './dto/program.dto';

@Injectable()
export class ProgramsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizations: OrganizationsService
  ) {}

  async create(dto: CreateProgramDto, userId: string) {
    // Only org admins/managers/staff of the owning organization may create.
    await this.organizations.assertMember(dto.organizationId, userId, [
      OrganizationMemberRole.ADMIN,
      OrganizationMemberRole.MANAGER,
      OrganizationMemberRole.STAFF,
    ]);

    return this.prisma.program.create({
      data: {
        organizationId: dto.organizationId,
        name: dto.name,
        type: dto.type,
        description: dto.description,
        budgetAmount: dto.budgetAmount,
        budgetAsset: dto.budgetAsset ?? 'USDC',
        maxAmountPerBeneficiary: dto.maxAmountPerBeneficiary,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        eligibilityCriteria: (dto.eligibilityCriteria ?? {}) as Prisma.InputJsonValue,
        requiredDocuments: (dto.requiredDocuments ?? []) as Prisma.InputJsonValue,
        approvalWorkflow: dto.approvalWorkflow ?? undefined,
        spendingRestrictions: (dto.spendingRestrictions ?? {}) as Prisma.InputJsonValue,
        isEmergency: dto.isEmergency ?? false,
        geographicScope: dto.geographicScope as Prisma.InputJsonValue,
        status: ProgramStatus.DRAFT,
        createdById: userId,
      },
    });
  }

  /** Public listing of active programs, filterable by type. */
  async listPublic(params: { page?: number; limit?: number; type?: string }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const where: Prisma.ProgramWhereInput = {
      deletedAt: null,
      status: ProgramStatus.ACTIVE,
      ...(params.type ? { type: params.type as any } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.program.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { organization: { select: { name: true, type: true } } },
      }),
      this.prisma.program.count({ where }),
    ]);
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const program = await this.prisma.program.findFirst({
      where: { id, deletedAt: null },
      include: { organization: { select: { id: true, name: true, type: true, status: true } } },
    });
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  async update(id: string, dto: UpdateProgramDto, userId: string) {
    const program = await this.findById(id);
    await this.organizations.assertMember(program.organizationId, userId, [
      OrganizationMemberRole.ADMIN,
      OrganizationMemberRole.MANAGER,
      OrganizationMemberRole.STAFF,
    ]);
    const { organizationId, startDate, endDate, ...rest } = dto;
    return this.prisma.program.update({
      where: { id },
      data: {
        ...rest,
        eligibilityCriteria: dto.eligibilityCriteria as Prisma.InputJsonValue,
        requiredDocuments: dto.requiredDocuments as Prisma.InputJsonValue,
        spendingRestrictions: dto.spendingRestrictions as Prisma.InputJsonValue,
        geographicScope: dto.geographicScope as Prisma.InputJsonValue,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      },
    });
  }

  async setStatus(id: string, status: ProgramStatus, userId: string) {
    const program = await this.findById(id);
    await this.organizations.assertMember(program.organizationId, userId, [
      OrganizationMemberRole.ADMIN,
      OrganizationMemberRole.MANAGER,
    ]);

    if (status === ProgramStatus.ACTIVE && program.organization.status !== 'VERIFIED') {
      throw new BadRequestException('Organization must be verified before activating programs');
    }

    return this.prisma.program.update({ where: { id }, data: { status } });
  }

  /** Returns remaining budget and utilization for a program. */
  async getStats(id: string) {
    const program = await this.findById(id);
    const [applications, approved, beneficiaries] = await this.prisma.$transaction([
      this.prisma.application.count({ where: { programId: id } }),
      this.prisma.application.count({ where: { programId: id, status: 'DISBURSED' } }),
      this.prisma.application.groupBy({
        by: ['beneficiaryId'],
        where: { programId: id, status: 'DISBURSED' },
        orderBy: { beneficiaryId: 'asc' },
      }),
    ]);
    const budget = Number(program.budgetAmount);
    const distributed = Number(program.distributedAmount);
    return {
      budgetAmount: String(budget),
      distributedAmount: String(distributed),
      remainingAmount: String(budget - distributed),
      utilizationPct: budget > 0 ? Math.round((distributed / budget) * 100) : 0,
      totalApplications: applications,
      approvedApplications: approved,
      uniqueBeneficiaries: beneficiaries.length,
    };
  }

  /** Atomically reserves budget for a disbursement (used by ApplicationsService). */
  async reserveBudget(programId: string, amount: number, tx: Prisma.TransactionClient) {
    const program = await tx.program.findUnique({ where: { id: programId } });
    if (!program) throw new NotFoundException('Program not found');
    const remaining = Number(program.budgetAmount) - Number(program.distributedAmount);
    if (amount > remaining) {
      throw new BadRequestException('Insufficient program budget for this disbursement');
    }
    await tx.program.update({
      where: { id: programId },
      data: { distributedAmount: { increment: amount } },
    });
  }
}
