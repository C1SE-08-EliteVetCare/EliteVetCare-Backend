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
import { RoomService } from './service/room.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from "../user/user.service";
import { Room } from "../../entities/room.entity";
import { ConnectedUserService } from "./service/connected-user.service";
import { ConnectedUser } from "../../entities/connected-user.entity";
import { PaginationDto } from "./dto/pagination.dto";
import { RoomI } from "./interfaces/room.interface";
import { MessageService } from "./service/message.service";
import { JoinedRoomService } from "./service/joined-room.service";
import { MessageI } from "./interfaces/message.interface";
import { PageI } from "./interfaces/page.interface";
import { JoinedRoomI } from "./interfaces/joined-room.interface";

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private roomService: RoomService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private messageService: MessageService
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

  afterInit(socket: Socket): any {}

  async handleConnection(socket: Socket) {
    console.log('connection', socket.id);
    const authHeader = socket.handshake.headers.authorization;

    if (authHeader && (authHeader as string).split(' ')[1]) {
      try {
        const userId = await this.authService.handleVerifyToken(
          authHeader && (authHeader as string).split(' ')[1],
        );
        const user = await this.userService.findOne(userId)
        socket.data.user = user;

        const rooms = await this.roomService.getRoomsForUser(user.id, {
          page: 1,
          limit: 10,
        });
        rooms.meta.currentPage = rooms.meta.currentPage - 1;

        // Save connection to DB
        await this.connectedUserService.create({ socketId: socket.id, user });

        // Only emit rooms the specific connected client
        return this.server.to(socket.id).emit('rooms', rooms);
        // socket.join(socket.data.email);
        // console.log('connect success', socket.data.email);
      } catch (e) {
        socket.disconnect();
      }
    } else {
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    console.log(socket.id, socket?.data?.email);
    // remove connection from DB
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI) {
    const createdRoom: Room = await this.roomService.createRoom(room, socket.data.user)
    for (const user of createdRoom.users) {
      const connections: ConnectedUser[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });

      // substract page -1 to match the angular material paginator
      rooms.meta.currentPage = rooms.meta.currentPage - 1;
      for (const connection of connections) {
        this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PaginationDto) {
    const rooms = await this.roomService.getRoomsForUser(socket.data.user.id, this.handleIncomingPageRequest(page));
    // substract page -1 to match the angular material paginator
    rooms.meta.currentPage = rooms.meta.currentPage - 1;
    return this.server.to(socket.id).emit('rooms', rooms);
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, room: RoomI) {
    const messages = await this.messageService.findMessagesForRoom(room, { limit: 10, page: 1 });
    messages.meta.currentPage = messages.meta.currentPage - 1;
    // Save Connection to Room
    await this.joinedRoomService.create({ socketId: socket.id, user: socket.data.user, room });
    // Send last messages from Room to User
    this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(socket: Socket) {
    // remove connection from JoinedRooms
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {
    const createdMessage = await this.messageService.create({...message, user: socket.data.user});
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);

    // TODO: Send new Message to all joined Users of the room (currently online)
    for(const user of joinedUsers) {
      this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }
  }

  private handleIncomingPageRequest(page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    // add page +1 to match angular material paginator
    page.page = page.page + 1;
    return page;
  }
}
