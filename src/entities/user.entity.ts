import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany, ManyToMany
} from "typeorm";
import { Role } from './role.entity';
import { Clinic } from './clinic.entity';
import { Pet } from './pet.entity';
import { Appointment } from './appointment.entity';
import { VetAppointment } from './vetAppointment.entity';
import { Feedback } from './feedback.entity';
import { Message } from './message.entity';
import { PetTreatment } from './petTreatment.entity';
import { Room } from "./room.entity";
import { ConnectedUser } from "./connected-user.entity";
import { JoinedRoom } from "./joined-room.entity";

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

  @Column('char', { length: 3, nullable: true })
  gender: string;

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

  @Column("varchar", { name: 'avatar_id', nullable: true, length: 100 })
  avatarId: string;

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

  @Column({ name: 'token_google', nullable: true })
  tokenGoogle: string;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date;

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

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Room[]

  @OneToMany(() => ConnectedUser, connection => connection.user)
  connections: ConnectedUser[];

  @OneToMany(() => JoinedRoom, joinedRoom => joinedRoom.room)
  joinedRooms: JoinedRoom[];
}
