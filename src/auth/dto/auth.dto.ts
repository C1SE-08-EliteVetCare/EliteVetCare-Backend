import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Type } from "class-transformer";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password is too short' })
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password is too short' })
  password: string;
}

export class VerifyDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: number;
}

export class ResendOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Type(() => Number)
  @IsNotEmpty()
  type: number;
}

export class ForgotDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  otp: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}
