import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clinic, Conversation, Message, User } from "../../entities";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { ClinicService } from "../clinic/clinic.service";

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, User, Clinic]), UserModule],
  controllers: [ConversationController],
  providers: [ConversationService, UserService, ClinicService],
})
export class ConversationModule {}
