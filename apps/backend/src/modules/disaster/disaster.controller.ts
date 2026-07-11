import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { UserRole } from '@prisma/client';
import { DisasterService } from './disaster.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class EmergencyReleaseDto {
  @IsString()
  programId: string;

  @IsString()
  region: string;

  @IsNumber()
  @Min(0.0000001)
  amountPerRecipient: number;

  @IsOptional()
  @IsString()
  assetCode?: string;
}

@ApiTags('disaster')
@ApiBearerAuth()
@Controller('disaster')
export class DisasterController {
  constructor(private readonly disasterService: DisasterService) {}

  @Get('regions')
  @ApiOperation({ summary: 'List regions with eligible beneficiary counts' })
  regions() {
    return this.disasterService.getRegions();
  }

  @Post('release')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Execute an emergency bulk fund release' })
  release(@Body() dto: EmergencyReleaseDto, @CurrentUser() user: AuthUser) {
    return this.disasterService.emergencyRelease(dto, user.id);
  }
}
