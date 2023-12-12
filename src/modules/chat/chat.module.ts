import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from "./chat.gateway";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { AuthService } from "../auth/auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation, Message, User } from "../../entities";
import { UserService } from "../user/user.service";
import { ConversationModule } from "../conversation/conversation.module";
import { ConversationService } from "../conversation/conversation.service";
@Module({
  imports: [AuthModule, UserModule, ChatModule, TypeOrmModule.forFeature([User, Message, Conversation]), ConversationModule],
  providers: [ChatGateway ,ChatService, AuthService, UserService, ConversationService],
})
export class ChatModule {}
