import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pet, PetCondition, PetTreatment } from "../entities";

@Module({
  imports: [TypeOrmModule.forFeature([Pet, PetCondition, PetTreatment])],
  controllers: [PetController],
  providers: [PetService],
})
export class PetModule {}
