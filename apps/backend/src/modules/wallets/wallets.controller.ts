import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { WalletsService } from './wallets.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class ConnectWalletDto {
  @IsString()
  publicKey: string;

  @IsOptional()
  @IsString()
  label?: string;
}

class CreateWalletDto {
  @IsOptional()
  @IsString()
  label?: string;
}

@ApiTags('wallets')
@ApiBearerAuth()
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a custodial wallet for the current user' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateWalletDto) {
    return this.walletsService.createCustodialWallet(user.id, dto.label);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect an external (non-custodial) wallet' })
  connect(@CurrentUser() user: AuthUser, @Body() dto: ConnectWalletDto) {
    return this.walletsService.connectExternalWallet(user.id, dto.publicKey, dto.label);
  }

  @Get('me')
  @ApiOperation({ summary: 'List the current user wallets' })
  listMine(@CurrentUser() user: AuthUser) {
    return this.walletsService.listUserWallets(user.id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get live on-chain balance for a wallet' })
  balance(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.walletsService.getBalance(id, user.id);
  }

  @Post(':id/qr')
  @ApiOperation({ summary: 'Generate a receive QR code for a wallet' })
  qr(@Param('id') id: string, @CurrentUser() user: AuthUser, @Query('amount') amount?: string) {
    return this.walletsService.generateReceiveQr(id, user.id, amount);
  }
}
