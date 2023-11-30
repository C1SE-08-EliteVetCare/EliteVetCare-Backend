import { IsOptional, Max, MaxLength, Min } from "class-validator";
import { Type } from "class-transformer";

export class UpdateFeedbackDto {
  @IsOptional()
  subject: string

  @IsOptional()
  content: string

  @Type(() => Number)
  @Min(1)
  @Max(5)
  @IsOptional()
  rating: number
}

