import { UserRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  displayName: string;

  @IsString()
  @IsOptional()
  picture?: string;

  // @IsEnum(UserRole)
  // role: UserRole;
}
