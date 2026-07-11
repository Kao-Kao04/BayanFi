import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

/**
 * Auditor-facing read + flag operations. Auditors have read access to all
 * transactions and immutable audit logs, plus the ability to flag anomalies.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async searchTransactions(params: {
    page?: number;
    limit?: number;
    status?: TransactionStatus;
    programId?: string;
    from?: string;
    to?: string;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const where: Prisma.TransactionWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.programId ? { programId: params.programId } : {}),
      ...(params.from || params.to
        ? {
            createdAt: {
              ...(params.from ? { gte: new Date(params.from) } : {}),
              ...(params.to ? { lte: new Date(params.to) } : {}),
            },
          }
        : {}),
    };
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

  async flagTransaction(id: string, auditorId: string, reason: string) {
    const txn = await this.prisma.transaction.findUnique({ where: { id } });
    if (!txn) throw new NotFoundException('Transaction not found');
    const metadata = (txn.metadata ?? {}) as Record<string, unknown>;
    return this.prisma.transaction.update({
      where: { id },
      data: {
        metadata: {
          ...metadata,
          flagged: true,
          flagReason: reason,
          flaggedBy: auditorId,
          flaggedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
    });
  }

  async queryLogs(params: { page?: number; limit?: number; userId?: string; action?: string }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const where: Prisma.AuditLogWhereInput = {
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.action ? { action: { contains: params.action, mode: 'insensitive' } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /** AI-flagged anomalies requiring auditor attention. */
  async getAnomalies() {
    return this.prisma.aIAnalysis.findMany({
      where: { result: 'REVIEW_REQUIRED' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
