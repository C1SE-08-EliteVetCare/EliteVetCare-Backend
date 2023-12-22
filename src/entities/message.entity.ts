import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from "./user.entity";
import { Conversation } from "./conversation.entity";
import { Exclude } from "class-transformer";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  content: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', nullable: true })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'user_id' })
  author: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  @Exclude()
  conversation: Conversation;
}
