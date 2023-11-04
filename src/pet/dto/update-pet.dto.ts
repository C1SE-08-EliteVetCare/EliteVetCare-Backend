import { IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

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

  @Type(() => Number)
  @IsOptional()
  age: number;

  @Type(() => Number)
  @IsOptional()
  weight: number;

  @IsOptional()
  @IsString()
  furColor: string;

  @IsOptional()
  @IsString()
  avatar: string
}
