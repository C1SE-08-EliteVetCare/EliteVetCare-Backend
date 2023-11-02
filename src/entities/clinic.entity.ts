import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';
import { PetTreatment } from "./petTreatment.entity";

@Entity()
export class Clinic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 50 })
  city: string;

  @Column('varchar', { length: 100 })
  district: string;

  @Column('varchar', { length: 100 })
  ward: string;

  @Column('varchar', { name: 'street_address', length: 100 })
  streetAddress: string;

  @Column()
  logo: string;

  @OneToMany(() => User, (user) => user.clinic)
  users: User[];

  @OneToMany(() => Appointment, (appointment) => appointment.clinic)
  appointments: Appointment[];

  @OneToMany(() => PetTreatment, (petTreatment) => petTreatment.clinic)
  petTreatments: PetTreatment[];
}
