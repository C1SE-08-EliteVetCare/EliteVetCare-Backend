import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from "./chat.gateway";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { RoomService } from "./service/room.service";
import { AuthService } from "../auth/auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Room } from "../../entities/room.entity";
import { Message, User } from "../../entities";
import { UserService } from "../user/user.service";
import { ConnectedUserService } from "./service/connected-user.service";
import { ConnectedUser } from "../../entities/connected-user.entity";
import { JoinedRoom } from "../../entities/joined-room.entity";
import { JoinedRoomService } from "./service/joined-room.service";
import { MessageService } from "./service/message.service";

@Module({
  imports: [AuthModule, UserModule, ChatModule, TypeOrmModule.forFeature([Room, User, ConnectedUser, JoinedRoom, Message])],
  providers: [ChatGateway, RoomService, ConnectedUserService, JoinedRoomService, MessageService ,ChatService, AuthService, UserService],
})
export class ChatModule {}
