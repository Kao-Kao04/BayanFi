import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  OrganizationStatus,
  OrganizationMemberRole,
  UserRole,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { StellarService } from '../stellar/stellar.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  InviteMemberDto,
} from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stellar: StellarService
  ) {}

  /** Registers a new organization and makes the creator its ADMIN member. */
  async create(dto: CreateOrganizationDto, creatorId: string) {
    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        type: dto.type,
        registrationNumber: dto.registrationNumber,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        description: dto.description,
        address: dto.address as Prisma.InputJsonValue,
        status: OrganizationStatus.PENDING,
        members: {
          create: { userId: creatorId, role: OrganizationMemberRole.ADMIN },
        },
      },
      include: { members: true },
    });
    return org;
  }

  async list(params: { page?: number; limit?: number; status?: OrganizationStatus }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const where: Prisma.OrganizationWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count({ where }),
    ]);
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const org = await this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
      include: { members: { include: { user: { select: { id: true, email: true, role: true } } } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto, userId: string) {
    await this.assertMember(id, userId, [OrganizationMemberRole.ADMIN, OrganizationMemberRole.MANAGER]);
    return this.prisma.organization.update({
      where: { id },
      data: { ...dto, address: dto.address as Prisma.InputJsonValue },
    });
  }

  /**
   * Verifies an organization (Super Admin only) and provisions its master
   * Stellar account used as the source of program funding.
   */
  async verify(id: string, adminId: string) {
    const org = await this.findById(id);
    if (org.status === OrganizationStatus.VERIFIED) {
      throw new ConflictException('Organization is already verified');
    }

    // Provision the organization master account on-chain.
    const { publicKey } = this.stellar.generateKeypair();
    await this.stellar.provisionAccount(publicKey);

    return this.prisma.organization.update({
      where: { id },
      data: {
        status: OrganizationStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedById: adminId,
        stellarPublicKey: publicKey,
      },
    });
  }

  async inviteMember(orgId: string, dto: InviteMemberDto, inviterId: string) {
    await this.assertMember(orgId, inviterId, [OrganizationMemberRole.ADMIN]);
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('User with this email does not exist');

    const existing = await this.prisma.organizationMember.findFirst({
      where: { organizationId: orgId, userId: user.id, deletedAt: null },
    });
    if (existing) throw new ConflictException('User is already a member');

    return this.prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        role: dto.role as OrganizationMemberRole,
        invitedById: inviterId,
      },
    });
  }

  async listMembers(orgId: string, requesterId: string) {
    await this.assertMember(orgId, requesterId);
    return this.prisma.organizationMember.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
  }

  async getStats(orgId: string, requesterId: string) {
    await this.assertMember(orgId, requesterId);
    const [programs, applications, totals] = await this.prisma.$transaction([
      this.prisma.program.count({ where: { organizationId: orgId, deletedAt: null } }),
      this.prisma.application.count({ where: { program: { organizationId: orgId } } }),
      this.prisma.program.aggregate({
        where: { organizationId: orgId, deletedAt: null },
        _sum: { budgetAmount: true, distributedAmount: true },
      }),
    ]);
    return {
      totalPrograms: programs,
      totalApplications: applications,
      totalBudget: String(totals._sum.budgetAmount ?? 0),
      totalDistributed: String(totals._sum.distributedAmount ?? 0),
    };
  }

  /** Throws unless the user is a member of the org with an allowed role. */
  async assertMember(orgId: string, userId: string, allowedRoles?: OrganizationMemberRole[]) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { organizationId: orgId, userId, deletedAt: null },
    });
    if (!member) {
      // Super admins bypass membership checks.
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role === UserRole.SUPER_ADMIN) return;
      throw new ForbiddenException('You are not a member of this organization');
    }
    if (allowedRoles && !allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient organization role');
    }
  }
}
