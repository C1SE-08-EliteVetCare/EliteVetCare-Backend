import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from "class-transformer";

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  species: string;

  @IsString()
  @IsNotEmpty()
  breed: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  age: string;

  @Type(() => Number)
  @IsNotEmpty()
  weight: number;

  @IsString()
  @IsNotEmpty()
  furColor: string;
}
