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

  @SubscribeMessage('onClientConnect')
  onClientConnect(@MessageBody() data: any, @ConnectedSocket() client: AuthenticatedSocket) {
    console.log('onClientConnect');
    console.log(data);
    console.log(client?.user);
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

    // console.log(`Recipient Socket: ${JSON.stringify(recipientSocket?.user)}`);

    authorSocket && authorSocket.emit('onMessage', payload);
    recipientSocket && recipientSocket.emit('onMessage', payload);
  }

  @OnEvent('conversation.create')
  handleConversationCreateEvent(payload: any) {
    console.log('Inside conversation.create');
    console.log(payload.recipient);
    const recipientSocket = this.sessions.getUserSocket(payload.recipient.id);
    recipientSocket && recipientSocket.emit('onConversation', payload);
  }

  @SubscribeMessage("onUserTyping")
  async handleTypingMessage(@MessageBody() data: any) {
    const { conversationId } = data
    console.log('User is typing');
    const id = parseInt(conversationId)
    const conversation = await this.conversationService.findOne(id)
    console.log(conversation);
  }
}
