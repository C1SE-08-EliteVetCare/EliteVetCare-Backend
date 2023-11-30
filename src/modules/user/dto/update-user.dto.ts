import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UsePipes } from '@nestjs/common';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  ward: string;

  @IsOptional()
  @IsString()
  streetAddress: string;

  @IsOptional()
  birthYear: number;

  @IsOptional()
  @IsString()
  phone: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
