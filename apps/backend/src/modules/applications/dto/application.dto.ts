import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  programId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  requestedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purpose?: string;
}

export class ReviewApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class ApproveApplicationDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.0000001)
  approvedAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class RejectApplicationDto {
  @ApiProperty()
  @IsString()
  reason: string;
}
