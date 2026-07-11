import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransparencyService } from './transparency.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('transparency')
@Public()
@Controller('public')
export class TransparencyController {
  constructor(private readonly transparencyService: TransparencyService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform-wide statistics (public)' })
  stats() {
    return this.transparencyService.getStats();
  }

  @Get('programs')
  @ApiOperation({ summary: 'Active programs with utilization (public)' })
  programs() {
    return this.transparencyService.listPrograms();
  }

  @Get('map')
  @ApiOperation({ summary: 'Anonymized geographic distribution (public)' })
  map() {
    return this.transparencyService.getDistributionMap();
  }

  @Get('transactions/daily')
  @ApiOperation({ summary: 'Daily transaction volume (public)' })
  daily(@Query('days') days?: string) {
    return this.transparencyService.getDailyTransactions(days ? parseInt(days, 10) : 30);
  }

  @Get('programs/:id/onchain')
  @ApiOperation({ summary: 'Verify a program funding wallet against the Stellar ledger (public)' })
  onchainProof(@Param('id') id: string) {
    return this.transparencyService.getProgramOnChainProof(id);
  }

  @Get('verify/:txHash')
  @ApiOperation({ summary: 'Verify a transaction hash on-chain (public)' })
  verify(@Param('txHash') txHash: string) {
    return this.transparencyService.verifyTransaction(txHash);
  }
}
