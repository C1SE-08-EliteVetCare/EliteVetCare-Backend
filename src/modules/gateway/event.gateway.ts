import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UserService } from "../user/user.service";
import { Inject, Logger } from "@nestjs/common";
import { ConversationService } from "../conversation/conversation.service";
import { OnEvent } from "@nestjs/event-emitter";
import { GatewaySessionManager } from "./gateway.session";
import { AuthenticatedSocket } from "./interface/AuthenticatedSocket.interface";

@WebSocketGateway({ cors: true, pingInterval: 10000, pingTimeout: 15000 })
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('MessageGateway');

  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(ConversationService)
    private readonly conversationService: ConversationService,
    @Inject(GatewaySessionManager)
    private readonly sessions: GatewaySessionManager
  ) {}

  afterInit(server: any): any {
    this.logger.log(server, 'Init');
  }

  async handleConnection(socket: AuthenticatedSocket) {
    console.log('New Incoming Connection');
    console.log(socket?.user);
    if (socket.user) {
      this.sessions.setUserSocket(socket.user.id, socket)
      socket.emit('connected', {status: 'good'})
    } else {
      socket.disconnect()
    }
  }

  async handleDisconnect(socket: AuthenticatedSocket) {
    this.sessions.removeUserSocket(socket?.user?.id)
    socket.disconnect();
    this.logger.log(socket.id, 'Disconnect');
  }

  @SubscribeMessage("createMessage")
  async handleCreateMessage(@MessageBody() data: any) {
    console.log('Create message', data);
  }

  @SubscribeMessage('onConversationJoin')
  onConversationJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onConversationJoin');
    client.join(data.conversationId);
    console.log(client.rooms);
    client.to(data.conversationId).emit('userJoin');
  }

  @SubscribeMessage('onConversationLeave')
  onConversationLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onConversationLeave');
    client.leave(data.conversationId);
    console.log(client.rooms);
    client.to(data.conversationId).emit('userLeave');
  }

  @SubscribeMessage('onTypingStart')
  onTypingStart(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onTypingStart');
    console.log(data.conversationId);
    console.log(client.rooms);
    client.to(data.conversationId).emit('onTypingStart');
  }

  @SubscribeMessage('onTypingStop')
  onTypingStop(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onTypingStop');
    console.log(data.conversationId);
    console.log(client.rooms);
    client.to(data.conversationId).emit('onTypingStop');
  }

  @OnEvent('message.create')
  handleMessageCreateEvent(payload: any) {
    console.log('Inside message.create');
    const {
      author,
    } = payload.message;

    const {
      creator, recipient
    } = payload.conversation

    const authorSocket = this.sessions.getUserSocket(author.id);
    const recipientSocket =
      author.id === creator.id
        ? this.sessions.getUserSocket(recipient.id) // author is creator in conversation
        : this.sessions.getUserSocket(creator.id); // author is recipient in conversation

    authorSocket && authorSocket.emit('onMessage', payload);
    recipientSocket && recipientSocket.emit('onMessage', payload);
  }

  @OnEvent('conversation.create')
  handleConversationCreateEvent(payload: any) {
    console.log('Inside conversation.create');
    const recipientSocket = this.sessions.getUserSocket(payload.recipient.id);
    recipientSocket && recipientSocket.emit('onConversation', payload);
  }

  // Notification
  @OnEvent('appointment.create')
  async handleAppointmentCreateEvent(payload: any) {
    const { user, appointment } = payload
    console.log('Inside appointment.create');
    const vets = await this.userService.findAllVetInClinic(appointment?.clinicId)

    for (let vet of vets) {
      const recipientSocket = this.sessions.getUserSocket(vet?.id);
      recipientSocket && recipientSocket.emit('onAppointmentCreate', {
        user: {
          id: user?.id,
          email: user?.email,
          fullName: user?.fullName,
          avatar: user?.avatar
        },
        appointmentDetail: appointment
      });
    }
  }

  @OnEvent('appointment.updateStatus')
  async handleAppointmentStatusEvent(payload: any) {
    console.log('Inside appointment.status');
    const recipientSocket = this.sessions.getUserSocket(payload?.appointment?.ownerId);
    recipientSocket && recipientSocket.emit('onAppointmentStatus', {
      message: "Update status successfully",
      appointmentDetail: payload.appointment,
    });
  }
}
