import { IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class FilterFeedbackDto {
  @IsOptional()
  @Type(() => Number)
  page: number;

  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsOptional()
  search: string;

  @Type(() => Number)
  @Min(1)
  @Max(5)
  @IsOptional()
  rating: number
}