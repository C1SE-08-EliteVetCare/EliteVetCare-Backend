import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Appointment } from "./appointment.entity";
import { User } from "./user.entity";

@Entity("vet_appointment")
export class VetAppointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "vet_id" })
  vetId: number;

  @CreateDateColumn({ name: "date_accepted" })
  dateAccepted: number;

  @OneToOne(() => Appointment)
  @JoinColumn({name: "vet_id"})
  appointment: Appointment

  @ManyToOne(() => User, (user) => user.vetAppointments)
  @JoinColumn({name: "owner_id"})
  user: User
}
