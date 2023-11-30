import {
  Column,
  CreateDateColumn,
  Entity, ManyToMany, OneToMany,
  PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { User } from "./user.entity";
import { JoinTable } from "typeorm";
import { Message } from "./message.entity";
import { JoinedRoom } from "./joined-room.entity";

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({nullable: true})
  description: string;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[]

  @OneToMany(() => JoinedRoom, joinedRoom => joinedRoom.room)
  joinedUsers: JoinedRoom[];

  @OneToMany(() => Message, message => message.room)
  messages: Message[];

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date
}
