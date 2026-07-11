import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { TransactionStatus, UserRole } from '@prisma/client';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class FlagDto {
  @IsString()
  reason: string;
}

@ApiTags('audit')
@ApiBearerAuth()
@Roles(UserRole.AUDITOR, UserRole.SUPER_ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Search transactions' })
  transactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: TransactionStatus,
    @Query('programId') programId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    return this.auditService.searchTransactions({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      programId,
      from,
      to,
    });
  }

  @Post('transactions/:id/flag')
  @ApiOperation({ summary: 'Flag a transaction for investigation' })
  flag(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: FlagDto) {
    return this.auditService.flagTransaction(id, user.id, dto.reason);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Query audit logs' })
  logs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string
  ) {
    return this.auditService.queryLogs({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      userId,
      action,
    });
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'View AI-flagged anomalies' })
  anomalies() {
    return this.auditService.getAnomalies();
  }
}
