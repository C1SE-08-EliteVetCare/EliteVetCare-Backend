import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Pet } from "./pet.entity";
import { User } from "./user.entity";

@Entity("pet_treatment")
export class PetTreatment {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  pet_id: number

  @Column()
  vet_id: number

  @CreateDateColumn({name: "date_accepted"})
  dateAccepted: number

  @ManyToOne(() => User, (user) => user.petTreatments)
  user: User

  @OneToOne(() => Pet, (pet) => pet.petTreatment)
  @JoinColumn({name: "pet_id"})
  pet: Pet
}