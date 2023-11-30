import { IsNotEmpty, IsString } from "class-validator";

export class UpdateVetAdviceDto {
  @IsString()
  @IsNotEmpty()
  vetAdvice: string

  @IsString()
  @IsNotEmpty()
  recommendedMedicines: string

  @IsString()
  @IsNotEmpty()
  recommendedMeal: string
}