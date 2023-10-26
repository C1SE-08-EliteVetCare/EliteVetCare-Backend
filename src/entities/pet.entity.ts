import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { PetTreatment } from "./petTreatment.entity";
import { PetCondition } from "./petCondition.entity";

@Entity()
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50 })
  name: string;

  @Column('varchar', { length: 100 })
  species: string;

  @Column('varchar', { length: 100 })
  breed: string;

  @Column()
  gender: boolean;

  @Column()
  age: number;

  @Column()
  weight: number;

  @Column('varchar', { name: 'fur_color', length: 100 })
  furColor: string;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @ManyToOne(() => User, (user) => user.pets)
  @JoinColumn({name: "owner_id"})
  user: User

  @OneToMany(() => PetCondition, (petCondition) => petCondition.pet)
  petConditions: PetCondition[]

  @OneToOne(() => PetTreatment, (petTreatment) => petTreatment.pet)
  petTreatment: PetTreatment
}
