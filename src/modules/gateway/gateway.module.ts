import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { EventGateway } from "./event.gateway";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { AuthService } from "../auth/auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clinic, Conversation, Message, User } from "../../entities";
import { UserService } from "../user/user.service";
import { ConversationModule } from "../conversation/conversation.module";
import { ConversationService } from "../conversation/conversation.service";
import { GatewaySessionManager } from "./gateway.session";
import { ClinicService } from "../clinic/clinic.service";
@Module({
  imports: [AuthModule, UserModule, GatewayModule, TypeOrmModule.forFeature([User, Message, Conversation, Clinic]), ConversationModule],
  providers: [EventGateway ,GatewayService, AuthService, UserService, ConversationService, GatewaySessionManager, ClinicService],
})
export class GatewayModule {}
