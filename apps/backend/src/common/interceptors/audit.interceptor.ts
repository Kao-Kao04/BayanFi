import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../database/prisma.service';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/**
 * Records mutating requests to the audit_logs table for compliance.
 * Read operations are skipped to keep the log signal high.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, user, ip } = request;

    if (!MUTATING_METHODS.has(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => this.record(request, 'SUCCESS'),
        error: (err) => this.record(request, 'FAILURE', err?.message),
      })
    );
  }

  private async record(request: any, status: string, errorMessage?: string) {
    try {
      const { method, originalUrl, user, ip, headers } = request;
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id ?? null,
          action: `${method} ${originalUrl}`,
          entityType: this.deriveEntity(originalUrl),
          ipAddress: ip ?? null,
          userAgent: headers?.['user-agent'] ?? null,
          requestId: headers?.['x-request-id'] ?? null,
          status,
          errorMessage: errorMessage ?? null,
        },
      });
    } catch {
      // Never let audit logging break the request path.
    }
  }

  private deriveEntity(url: string): string {
    const parts = url.split('/').filter(Boolean);
    const idx = parts.indexOf('v1');
    const resource = idx >= 0 ? parts[idx + 1] : parts[0];
    return (resource ?? 'UNKNOWN').toUpperCase();
  }
}
