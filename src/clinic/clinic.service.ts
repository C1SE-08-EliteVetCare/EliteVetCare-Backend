import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { UpdateClinicDto } from "./dto/update-clinic.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Clinic } from "../entities";
import { Repository } from "typeorm";

@Injectable()
export class ClinicService {
  constructor(@InjectRepository(Clinic) private clinicRepository: Repository<Clinic>) {
  }

  create(createClinicDto: CreateClinicDto) {
    return "This action adds a new clinic";
  }

  findAll() {
    try {
      return this.clinicRepository.find()
    } catch (error) {
      throw new BadRequestException("Has error when fill all clinic");
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} clinic`;
  }

  update(id: number, updateClinicDto: UpdateClinicDto) {
    return `This action updates a #${id} clinic`;
  }

  remove(id: number) {
    return `This action removes a #${id} clinic`;
  }
}
