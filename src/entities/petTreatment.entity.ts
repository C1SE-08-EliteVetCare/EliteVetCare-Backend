import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pet } from './pet.entity';
import { User } from './user.entity';
import { Clinic } from './clinic.entity';

@Entity('pet_treatment')
export class PetTreatment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pet_id' })
  petId: number;

  @Column({ name: 'vet_id', nullable: true })
  vetId: number;

  @Column({ name: 'clinic_id' })
  clinicId: number;

  @Column('date',{ name: 'date_accepted', nullable: true})
  dateAccepted: Date;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.petTreatments)
  @JoinColumn({ name: 'vet_id' })
  user: User;

  @OneToOne(() => Pet, (pet) => pet.petTreatment)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @ManyToOne(() => Clinic, (clinic) => clinic.petTreatments)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;
}
