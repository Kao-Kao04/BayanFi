import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { UserRole } from '@prisma/client';
import { TransactionsService } from './transactions.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class PayMerchantDto {
  @IsString()
  merchantId: string;

  @IsNumber()
  @Min(0.0000001)
  amount: number;

  @IsOptional()
  @IsString()
  assetCode?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('pay')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pay a merchant from the beneficiary wallet' })
  pay(@CurrentUser() user: AuthUser, @Body() dto: PayMerchantDto) {
    return this.transactionsService.payMerchant({
      beneficiaryUserId: user.id,
      merchantId: dto.merchantId,
      amount: dto.amount,
      assetCode: dto.assetCode ?? 'USDC',
      memo: dto.memo,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a transaction' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.transactionsService.findById(id, user.id, user.role === UserRole.AUDITOR);
  }

  @Public()
  @Get(':id/proof')
  @ApiOperation({ summary: 'Get blockchain proof for a transaction (public)' })
  proof(@Param('id') id: string) {
    return this.transactionsService.getProof(id);
  }
}
