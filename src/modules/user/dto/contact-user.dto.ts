import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ContactUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  phone: string

  @IsString()
  @IsNotEmpty()
  content: string
}