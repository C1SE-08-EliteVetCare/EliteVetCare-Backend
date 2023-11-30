import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Room } from "./room.entity";

@Entity()
export class JoinedRoom {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: "socket_id"})
  socketId: string;

  @ManyToOne(() => User, user => user.joinedRooms)
  @JoinColumn({name: "user_id"})
  user: User;

  @ManyToOne(() => Room, room => room.joinedUsers)
  @JoinColumn({name: "room_id"})
  room: Room;
}