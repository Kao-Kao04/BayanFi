import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ApplicationsService } from './applications.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import {
  CreateApplicationDto,
  ReviewApplicationDto,
  ApproveApplicationDto,
  RejectApplicationDto,
} from './dto/application.dto';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(UserRole.BENEFICIARY)
  @ApiOperation({ summary: 'Create a draft application' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(user.id, dto);
  }

  @Get()
  @Roles(UserRole.BENEFICIARY)
  @ApiOperation({ summary: 'List own applications' })
  listMine(@CurrentUser() user: AuthUser) {
    return this.applicationsService.listForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application details' })
  findOne(@Param('id') id: string) {
    return this.applicationsService.findById(id);
  }

  @Post(':id/submit')
  @Roles(UserRole.BENEFICIARY)
  @ApiOperation({ summary: 'Submit an application for review (runs AI checks)' })
  submit(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.applicationsService.submit(id, user.id);
  }

  @Post(':id/review')
  @Roles(UserRole.STAFF, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Mark an application under review' })
  review(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: ReviewApplicationDto) {
    return this.applicationsService.review(id, user.id, dto);
  }

  @Post(':id/approve')
  @Roles(UserRole.STAFF, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Approve an application and disburse funds' })
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: ApproveApplicationDto) {
    return this.applicationsService.approve(id, user.id, dto);
  }

  @Post(':id/reject')
  @Roles(UserRole.STAFF, UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Reject an application' })
  reject(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: RejectApplicationDto) {
    return this.applicationsService.reject(id, user.id, dto.reason);
  }

  @Post(':id/cancel')
  @Roles(UserRole.BENEFICIARY)
  @ApiOperation({ summary: 'Cancel an application' })
  cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.applicationsService.cancel(id, user.id);
  }
}
