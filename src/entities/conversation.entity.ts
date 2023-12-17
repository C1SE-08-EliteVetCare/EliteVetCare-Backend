import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', nullable: true, })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone', nullable: true })
  updatedAt: Date;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: ['insert', 'remove', 'update'],
  })
  messages: Message[];

  @OneToOne(() => Message, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'last_message_sent' })
  lastMessageSent: Message;
}
