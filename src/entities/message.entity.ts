import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, JoinTable, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { User } from "./user.entity";
import { Room } from "./room.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  content: string;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({name: "user_id"})
  user: User

  @ManyToOne(() => Room, room => room.messages)
  @JoinTable()
  room: Room;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date;
}
