import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user.entity";
import { Inbox } from "./Inbox.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: "conversation_id" })
  conversationId: number;

  @Column("text")
  content: string;

  @CreateDateColumn({ name: "date_send" })
  dateSend: number;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({name: "user_id"})
  user: User

  @ManyToOne(() => Inbox, (inbox) => inbox.messages)
  @JoinColumn({name: "conversation_id"})
  inbox: Inbox
}
