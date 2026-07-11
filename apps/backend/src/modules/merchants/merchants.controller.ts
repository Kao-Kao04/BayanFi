import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { MerchantsService } from './merchants.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateMerchantDto } from './dto/merchant.dto';

@ApiTags('merchants')
@ApiBearerAuth()
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a merchant and provision a wallet' })
  register(@CurrentUser() user: AuthUser, @Body() dto: CreateMerchantDto) {
    return this.merchantsService.register(user.id, dto);
  }

  @Get('me')
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: 'Get own merchant profile' })
  me(@CurrentUser() user: AuthUser) {
    return this.merchantsService.getByUserId(user.id);
  }

  @Post('me/qr')
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: 'Generate a payment QR code' })
  qr(@CurrentUser() user: AuthUser, @Query('amount') amount?: string) {
    return this.merchantsService.generateQr(user.id, amount);
  }

  @Get('me/sales')
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: 'Get sales analytics' })
  sales(@CurrentUser() user: AuthUser) {
    return this.merchantsService.getSales(user.id);
  }

  @Get('me/transactions')
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: 'Get merchant transaction history' })
  transactions(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.merchantsService.getTransactions(
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20
    );
  }

  @Post(':id/verify')
  @Roles(UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Verify a merchant' })
  verify(@Param('id') id: string) {
    return this.merchantsService.verify(id);
  }
}
