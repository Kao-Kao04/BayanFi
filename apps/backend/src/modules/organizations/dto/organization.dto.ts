import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { OrganizationType } from '@prisma/client';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Department of Social Welfare' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: OrganizationType })
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiProperty({ example: 'contact@dswd.gov.ph' })
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  address?: Record<string, unknown>;
}

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}

export class InviteMemberDto {
  @ApiProperty({ example: 'staff@dswd.gov.ph' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'STAFF', enum: ['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'] })
  @IsString()
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
}
