import {
  Column,
  Entity, JoinColumn, ManyToOne, OneToMany,
  PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { Pet } from "./pet.entity";

@Entity('pet_condition')
export class PetCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pet_id: number;

  @Column('text', { nullable: true })
  meal: string;

  @Column('text', { nullable: true })
  manifestation: string;

  @Column('text', { nullable: true })
  condition_of_defecation: string;

  @Column({ name: 'actual_img', nullable: true })
  actualImg: string;

  @Column('text', { name: 'vet_advice', nullable: true })
  vetAdvice: string;

  @UpdateDateColumn({ name: 'date_update' })
  dateUpdate: string;

  @ManyToOne(() => Pet, (pet) => pet.petConditions)
  @JoinColumn({name: "pet_id"})
  pet: Pet
}
