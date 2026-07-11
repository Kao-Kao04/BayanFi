import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProgramStatus, UserRole } from '@prisma/client';
import { ProgramsService } from './programs.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateProgramDto, UpdateProgramDto } from './dto/program.dto';

@ApiTags('programs')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ORG_ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a new assistance program' })
  create(@Body() dto: CreateProgramDto, @CurrentUser() user: AuthUser) {
    return this.programsService.create(dto, user.id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active programs (public)' })
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string
  ) {
    return this.programsService.listPublic({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      type,
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get program details (public)' })
  findOne(@Param('id') id: string) {
    return this.programsService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ORG_ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update a program' })
  update(@Param('id') id: string, @Body() dto: UpdateProgramDto, @CurrentUser() user: AuthUser) {
    return this.programsService.update(id, dto, user.id);
  }

  @Post(':id/activate')
  @ApiBearerAuth()
  @Roles(UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Activate a program' })
  activate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.programsService.setStatus(id, ProgramStatus.ACTIVE, user.id);
  }

  @Post(':id/pause')
  @ApiBearerAuth()
  @Roles(UserRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Pause a program' })
  pause(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.programsService.setStatus(id, ProgramStatus.PAUSED, user.id);
  }

  @Public()
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get program statistics (public)' })
  stats(@Param('id') id: string) {
    return this.programsService.getStats(id);
  }
}
