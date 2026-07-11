import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';
import { AiService } from './ai.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class ChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Ask the BayanFi assistant a question' })
  chat(@CurrentUser() user: AuthUser, @Body() dto: ChatDto) {
    return this.aiService.chat(user.id, dto.message, dto.context);
  }

  @Get('forecast/:programId')
  @Roles(UserRole.ORG_ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get a budget forecast for a program' })
  forecast(@Param('programId') programId: string) {
    return this.aiService.forecast(programId);
  }
}
