import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Clinic } from "./clinic.entity";

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  type: number;

  @Column({name: 'clinic_id', nullable: true})
  clinicId: number;

  @Column('varchar', { length: 150 })
  subject: string;

  @Column('text')
  content: string;

  @Column()
  rating: number;

  @CreateDateColumn({ type: "timestamp with time zone", name: 'created_at' })
  createdAt: number;

  @ManyToOne(() => User, (user) => user.feedbacks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Clinic, (clinic) => clinic.feedbacks)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;
}
