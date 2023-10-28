import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from "class-transformer";

export class CreatePetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  species: string;

  @IsNotEmpty()
  @IsString()
  breed: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
  @IsString()
  age: string;

  @IsNotEmpty()
  @Type(() => Number)
  weight: number;

  @IsNotEmpty()
  @IsString()
  furColor: string;
}
