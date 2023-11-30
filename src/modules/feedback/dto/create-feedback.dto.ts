import { IsNotEmpty, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateFeedbackDto {
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
