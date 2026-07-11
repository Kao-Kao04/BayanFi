import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { BeneficiariesService } from './beneficiaries.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateBeneficiaryDto, UpdateBeneficiaryDto } from './dto/beneficiary.dto';

@ApiTags('beneficiaries')
@ApiBearerAuth()
@Controller('beneficiaries')
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Post()
  @ApiOperation({ summary: 'Create beneficiary profile' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBeneficiaryDto) {
    return this.beneficiariesService.createProfile(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get own beneficiary profile' })
  me(@CurrentUser() user: AuthUser) {
    return this.beneficiariesService.getByUserId(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own beneficiary profile' })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateBeneficiaryDto) {
    return this.beneficiariesService.update(user.id, dto);
  }

  @Get()
  @Roles(UserRole.ORG_ADMIN, UserRole.STAFF, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Search beneficiaries (staff)' })
  search(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('region') region?: string,
    @Query('query') query?: string
  ) {
    return this.beneficiariesService.search({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      region,
      query,
    });
  }

  @Get(':id')
  @Roles(UserRole.ORG_ADMIN, UserRole.STAFF, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get beneficiary by id (staff)' })
  findOne(@Param('id') id: string) {
    return this.beneficiariesService.getById(id);
  }
}
