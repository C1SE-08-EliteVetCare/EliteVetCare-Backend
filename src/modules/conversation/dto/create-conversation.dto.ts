import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateConversationDto {
  @Type(() => Number)
  @IsNotEmpty()
  recipientId: number;

  @IsString()
  @IsNotEmpty()
  message: string
}
