import { IsNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";

export class UpdatePetConditionDto {
  @IsNotEmpty()
  @Type(() => Number)
  portion: number

  @IsNotEmpty()
  @Type(() => Number)
  weight: number

  @IsString()
  @IsNotEmpty()
  meal: string

  @IsString()
  @IsNotEmpty()
  manifestation: string

  @IsString()
  @IsNotEmpty()
  conditionOfDefecation: string
}