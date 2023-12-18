import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation, Message, User } from "../../entities";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message ,User]), UserModule],
  controllers: [ConversationController],
  providers: [ConversationService, UserService],
})
export class ConversationModule {}
