import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

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
  users: User[]
}