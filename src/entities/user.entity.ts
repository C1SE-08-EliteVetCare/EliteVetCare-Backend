import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { Clinic } from './clinic.entity';
import { Pet } from './pet.entity';
import { Appointment } from './appointment.entity';
import { VetAppointment } from './vetAppointment.entity';
import { Feedback } from './feedback.entity';
import { Message } from './message.entity';
import { Inbox } from './Inbox.entity';
import { PetTreatment } from './petTreatment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'full_name', length: 50 })
  fullName: string;

  @Column('varchar', { unique: true, length: 100 })
  email: string;

  @Column('varchar')
  password: string;

  @Column({ default: true, nullable: true })
  gender: boolean;

  @Column('varchar', { length: 100, nullable: true })
  city: string;

  @Column('varchar', { length: 150, nullable: true })
  district: string;

  @Column('varchar', { length: 100, nullable: true })
  ward: string;

  @Column('varchar', { name: 'street_address', length: 100, nullable: true })
  streetAddress: string;

  @Column({ name: 'birth_year', nullable: true })
  birthYear: number;

  @Column({ nullable: true })
  avatar: string;

  @Column('varchar', { length: 200 })
  phone: string;

  @Column({ name: 'operating_status', default: false })
  operatingStatus: boolean;

  @Column({ name: 'hashed_rt', nullable: true })
  hashedRt: string;

  @Column({ name: 'role_id', default: 2 })
  roleId: number;

  @Column({ name: 'clinic_id', nullable: true })
  clinicId: number;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Clinic, (clinic) => clinic.users)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @OneToMany(() => Pet, (pet) => pet.user)
  pets: Pet[];

  @OneToMany(() => PetTreatment, (petTreatment) => petTreatment.user)
  petTreatments: PetTreatment[];

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  @OneToMany(() => VetAppointment, (vetAppointment) => vetAppointment.user)
  vetAppointments: VetAppointment[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @OneToMany(() => Inbox, (inbox) => inbox.user)
  inboxes: Inbox[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
