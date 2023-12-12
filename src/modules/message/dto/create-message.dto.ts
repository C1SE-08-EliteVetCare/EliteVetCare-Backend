import { IsNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string

  @Type(() => Number)
  @IsNotEmpty()
  conversationId: number
}
