import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { VetAppointment } from "./vetAppointment.entity";

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column({ name: 'appointment_date' })
  appointmentDate: number;

  @Column({ name: 'appointment_time' })
  appointmentTime: number;

  @Column({ name: 'service_package' })
  servicePackage: string;

  @Column({ name: 'clinic_id' })
  clinicId: number;

  @Column('varchar', { length: 20 })
  status: string;

  @Column({ name: 'accepted_id' })
  acceptedId: number;

  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn({name: "owner_id"})
  user: User

  @OneToOne(() => VetAppointment, (vetAppointment) => vetAppointment.appointment)
  vetAppointment: VetAppointment
}
