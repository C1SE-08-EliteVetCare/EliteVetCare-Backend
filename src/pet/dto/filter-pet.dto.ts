import { IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class FilterPetDto {
  @IsOptional()
  @Type(() => Number)
  page: number;

  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsOptional()
  search: string;

  @IsOptional()
  breed: string;

  @IsOptional()
  species: string;

  @IsOptional()
  @Type(() => Number)
  status: string;
}