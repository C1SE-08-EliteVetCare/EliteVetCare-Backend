import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class ConnectedUser {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'socket_id'})
  socketId: string;

  @ManyToOne(() => User, user => user.connections)
  @JoinColumn({name: "user_id"})
  user: User;
}