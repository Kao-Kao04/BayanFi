import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsArray,
  Min,
  MinLength,
} from 'class-validator';
import { ProgramType, ApprovalWorkflow } from '@prisma/client';

export class CreateProgramDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty({ example: 'TES College Scholarship 2026' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ enum: ProgramType })
  @IsEnum(ProgramType)
  type: ProgramType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @Min(1)
  budgetAmount: number;

  @ApiPropertyOptional({ example: 'USDC', default: 'USDC' })
  @IsOptional()
  @IsString()
  budgetAsset?: string;

  @ApiPropertyOptional({ example: 20000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmountPerBeneficiary?: number;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2027-05-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  eligibilityCriteria?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  requiredDocuments?: string[];

  @ApiPropertyOptional({ enum: ApprovalWorkflow })
  @IsOptional()
  @IsEnum(ApprovalWorkflow)
  approvalWorkflow?: ApprovalWorkflow;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  spendingRestrictions?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  geographicScope?: Record<string, unknown>;
}

export class UpdateProgramDto extends PartialType(CreateProgramDto) {}

export class FundProgramDto {
  @ApiProperty({ example: 1000000 })
  @IsNumber()
  @Min(1)
  amount: number;
}
