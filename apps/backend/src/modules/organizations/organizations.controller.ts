import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationStatus, UserRole } from '@prisma/client';
import { OrganizationsService } from './organizations.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  InviteMemberDto,
} from './dto/organization.dto';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new organization' })
  create(@Body() dto: CreateOrganizationDto, @CurrentUser() user: AuthUser) {
    return this.organizationsService.create(dto, user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all organizations (Super Admin)' })
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrganizationStatus
  ) {
    return this.organizationsService.list({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization details' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an organization' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.organizationsService.update(id, dto, user.id);
  }

  @Post(':id/verify')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Verify an organization and provision its Stellar account' })
  verify(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.organizationsService.verify(id, user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Invite a member to the organization' })
  invite(
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.organizationsService.inviteMember(id, dto, user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List organization members' })
  members(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.organizationsService.listMembers(id, user.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get organization statistics' })
  stats(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.organizationsService.getStats(id, user.id);
  }
}
