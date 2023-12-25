import { IsNotEmpty, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateFeedbackDto {
  @Type(() => Number)
  @IsNotEmpty()
  type: number

  @Type(() => Number)
  @IsOptional()
  clinicId: number

  @IsNotEmpty()
  subject: string

  @IsNotEmpty()
  content: string

  @Type(() => Number)
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number
}
