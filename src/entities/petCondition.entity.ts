import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pet } from './pet.entity';

@Entity('pet_condition')
export class PetCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pet_id' })
  petId: number;

  @Column({ nullable: true })
  portion: number;

  @Column('float', { nullable: true })
  weight: number;

  @Column('text', { nullable: true })
  meal: string;

  @Column('text', { nullable: true })
  manifestation: string;

  @Column('text', { name: 'condition_of_defecation', nullable: true })
  conditionOfDefecation: string;

  @Column({ name: 'actual_img', nullable: true })
  actualImg: string;

  @Column('text', { name: 'vet_advice', nullable: true })
  vetAdvice: string;

  @UpdateDateColumn({ name: 'date_update' })
  dateUpdate: string;

  @ManyToOne(() => Pet, (pet) => pet.petConditions)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}