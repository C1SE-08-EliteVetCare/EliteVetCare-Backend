import { IsOptional, IsString } from "class-validator";

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  species: string;

  @IsOptional()
  @IsString()
  breed: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  age: string;

  @IsOptional()
  weight: number;

  @IsOptional()
  @IsString()
  furColor: string;

  @IsOptional()
  @IsString()
  avatar: string
}
