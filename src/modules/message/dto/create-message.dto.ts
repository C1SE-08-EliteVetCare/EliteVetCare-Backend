import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateMessageDto {
  @IsString()
  @IsOptional()
  content: string

  @Type(() => Number)
  @IsNotEmpty()
  conversationId: number
}
