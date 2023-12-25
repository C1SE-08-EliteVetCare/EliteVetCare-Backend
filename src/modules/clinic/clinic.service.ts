import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { UpdateClinicDto } from "./dto/update-clinic.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Clinic } from "../../entities";
import { Repository } from "typeorm";

@Injectable()
export class ClinicService {
  constructor(@InjectRepository(Clinic) private clinicRepository: Repository<Clinic>) {
  }

  create(createClinicDto: CreateClinicDto) {
    return "This action adds a new clinic";
  }

  async findAll() {
    try {
      const clinicsWithAverageRating = await this.clinicRepository
        .createQueryBuilder('clinic')
        .leftJoin('clinic.feedbacks', 'feedback')
        .addSelect(['ROUND(AVG(COALESCE(feedback.rating, 0)), 1) AS averageRating'])
        .groupBy('clinic.id')
        .orderBy('averageRating', 'DESC')
        .getRawMany()

      return clinicsWithAverageRating.map(item => ({
        id: item.clinic_id,
        name: item.clinic_name,
        city: item.clinic_city,
        district: item.clinic_district,
        ward: item.clinic_ward,
        streetAddress: item.clinic_street_address,
        logo: item.clinic_logo,
        averageRating: item.averagerating == 0.0 ? 0 : item.averagerating,
      }));

    } catch (error) {
      throw new BadRequestException("Has error when find all clinic");
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
