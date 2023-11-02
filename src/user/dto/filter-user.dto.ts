import { IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class FilterUserDto {
  @IsOptional()
  @Type(() => Number)
  page: number;

  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsOptional()
  search: string;
}