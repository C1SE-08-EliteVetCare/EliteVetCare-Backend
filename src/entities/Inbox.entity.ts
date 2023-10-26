import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, ManyToOne, OneToMany, OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user.entity";
import { VetAppointment } from "./vetAppointment.entity";
import { Message } from "./message.entity";

@Entity()
export class Inbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vet_id' })
  vetId: number;

  @Column('varchar', { name: 'conversation_name', length: 50 })
  conversationName: number;

  @ManyToOne(() => User, (user) => user.inboxes)
  @JoinColumn({name: "vet_id"})
  user: User

  @OneToMany(() => Message, (message) => message.inbox)
  messages: Message[]
}
