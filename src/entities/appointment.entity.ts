import {
  Column, CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { User } from './user.entity';
import { VetAppointment } from './vetAppointment.entity';
import { Clinic } from "./clinic.entity";

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column('date',{ name: 'appointment_date' })
  appointmentDate: Date;

  @Column({ name: 'appointment_time' })
  appointmentTime: string;

  @Column('varchar',{ name: 'service_package', length: 30 })
  servicePackage: string;

  @Column({ name: 'clinic_id' })
  clinicId: number;

  @Column('int')
  status: number;

  @Column({ name: 'accepted_id', nullable: true })
  acceptedId: number;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn({ name: 'owner_id' })
  user: User;

  @OneToOne(
    () => VetAppointment,
    (vetAppointment) => vetAppointment.appointment,
  )
  @JoinColumn({ name: 'accepted_id' })
  vetAppointment: VetAppointment;

  @ManyToOne(
    () => Clinic,
    (clinic: Clinic) => clinic.appointments,
  )
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic
}
