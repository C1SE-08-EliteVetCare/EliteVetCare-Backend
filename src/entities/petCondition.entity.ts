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

  @Column("varchar", { name: 'actual_img_id', nullable: true, length: 100 })
  actualImgId: string;

  @Column('text', { name: 'vet_advice', nullable: true })
  vetAdvice: string;

  @Column('text', { name: 'recommended_medicines', nullable: true })
  recommendedMedicines: string;

  @Column('text', { name: 'recommended_meal', nullable: true })
  recommendedMeal: string;

  @UpdateDateColumn({type: 'date' ,name: 'date_update' })
  dateUpdate: string;

  @ManyToOne(() => Pet, (pet) => pet.petConditions)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}
