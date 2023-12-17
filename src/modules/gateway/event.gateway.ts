import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UserService } from "../user/user.service";
import { Inject, Logger, Session, UnauthorizedException } from "@nestjs/common";
import { ConversationService } from "../conversation/conversation.service";
import { OnEvent } from "@nestjs/event-emitter";
import { GatewaySessionManager } from "./gateway.session";
import { AuthenticatedSocket } from "./interface/AuthenticatedSocket.interface";

@WebSocketGateway({ cors: true })
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('MessageGateway');

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
    @Inject(GatewaySessionManager)
    private readonly sessions: GatewaySessionManager
  ) {}

  // handleEmitSocket({ data, event, to }) {
  //   if (to) {
  //     // this.server.to(to.map(el => String(el))).emit(event, data);
  //     this.server.to(to).emit(event, data);
  //   } else {
  //     this.server.emit(event, data);
  //   }
  // }
  // @SubscribeMessage('send-message')
  // async handleMessage(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() data: any,
  // ) {
  //   console.log('message: ', data);
  //   setTimeout(() => {
  //     this.server.emit('message', data);
  //   }, 1000);
  // }

  afterInit(server: any): any {
    this.logger.log(server, 'Init');
  }

  async handleConnection(socket: AuthenticatedSocket) {
    // console.log('connection', client.id);
    console.log('room', socket.rooms);
    // this.sessions.setUserSocket(socket.user.id, socket)

    // const authHeader = socket.handshake.headers.authorization;
    // if (authHeader && (authHeader as string).split(' ')[1]) {
    //   try {
    //     // const userId = await this.authService.handleVerifyToken(
    //     //   authHeader && (authHeader as string).split(' ')[1],
    //     // );
    //     // console.log(userId);
    //
    //     // client.data.user = this.userService.findOne(userId);
    //
    //     // Only emit rooms the specific connected client
    //     // socket.join(socket.data.email);
    //     // console.log('connect success', socket.data.email);
    //   } catch (e) {
    //     socket.disconnect()
    //   }
    // } else {
    //   socket.disconnect();
    // }
  }

  async handleDisconnect(socket: Socket) {
    // console.log(socket.id, socket?.data?.email);
    // remove connection from DB
    socket.disconnect();
    // need handle remove socketId to information table
    this.logger.log(socket.id, 'Disconnect');
  }

  @SubscribeMessage("createMessage")
  async handleCreateMessage(@MessageBody() data: any) {
    console.log('Create message', data);
  }

  @OnEvent('message.create')
  handleMessageCreateEvent(payload: any) {
    console.log('Inside message.create');
    this.server.emit('onMessage', payload)
  }
}
