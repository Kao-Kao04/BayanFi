import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';
import { UserRole } from '@prisma/client';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export class RegisterDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecureP@ss123', description: 'Min 8 chars, upper, lower, number' })
  @Matches(PASSWORD_REGEX, {
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  })
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.BENEFICIARY })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: '+639171234567' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @MinLength(1)
  password: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class WalletLoginDto {
  @ApiProperty({ example: 'GABC...', description: 'Stellar public key' })
  @IsString()
  @MinLength(56)
  publicKey: string;

  @ApiProperty({ description: 'Base64-encoded signature of the challenge' })
  @IsString()
  signature: string;

  @ApiProperty({ description: 'Server-issued challenge nonce' })
  @IsString()
  challenge: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecureP@ss123' })
  @Matches(PASSWORD_REGEX, {
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  })
  password: string;
}

export class MfaVerifyDto {
  @ApiProperty()
  @IsString()
  mfaToken: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}
