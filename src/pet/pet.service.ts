import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CloudinaryService } from '../config/cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Pet, PetCondition, PetTreatment } from "../entities";
import { IsNull, Like, Repository } from "typeorm";
import { FilterPetDto } from './dto/filter-pet.dto';
import { UpdatePetConditionDto } from './dto/update-pet-condition.dto';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(PetCondition)
    private petConRepository: Repository<PetCondition>,
    @InjectRepository(PetTreatment)
    private petTreatmentRepository: Repository<PetTreatment>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    id: number,
    createPetDto: CreatePetDto,
    file: Express.Multer.File,
  ) {
    try {
      const folder = 'pet-avatar';
      const { url } = await this.cloudinaryService.uploadFile(file, folder);

      await this.petRepository
        .createQueryBuilder()
        .insert()
        .into(Pet)
        .values([
          {
            ...createPetDto,
            avatar: url,
            ownerId: id,
          },
        ])
        .execute();

      return {
        message: 'Create successfully',
      };
    } catch (error) {
      throw new BadRequestException('Has error when create');
    }
  }

  async sendTreatment(ownerId: number, petId: number, clinicId: number) {
    const pet = await this.petRepository.findOne({
      where: { id: petId, ownerId },
    });
    if (!pet) {
      throw new NotFoundException('You do not have a record for this pet');
    }
    const newTreatment = this.petTreatmentRepository.create({
      petId,
      clinicId,
    });
    await this.petTreatmentRepository.save(newTreatment);
    return {
      message: 'Send successfully',
    };
  }

  async acceptTreatment(vetId: number, treatmentId: number) {
    const currentDate = new Date();
    const dateAccepted = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}`;
    const res = await this.petTreatmentRepository.update(
      { id: treatmentId },
      {
        vetId,
        dateAccepted,
      },
    );
    if (res.affected <= 0) {
      throw new BadRequestException('Has error when update');
    }
    return {
      message: 'Accept successfully',
    };
  }

  async findAll(ownerId: number, query: FilterPetDto): Promise<any> {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';

    const [res, total] = await this.petRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
      where: { ownerId, name: Like(`%${keyword}%`) },
    });
    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: res,
      total,
      currentPage: page,
      lastPage,
      nextPage,
      prevPage,
    };
  }

  findOne(id: number, ownerId: number) {
    return this.petRepository.findOne({
      where: { id, ownerId },
    });
  }

  async update(
    id: number,
    ownerId: number,
    updatePetDto: UpdatePetDto,
    file: Express.Multer.File,
  ) {
    if (file) {
      const folder = 'pet-avatar';
      const { url } = await this.cloudinaryService.uploadFile(file, folder);
      updatePetDto.avatar = url;
    }

    const res = await this.petRepository
      .createQueryBuilder()
      .update(Pet)
      .set({ ...updatePetDto })
      .where('id= :id', { id })
      .andWhere('ownerId = :ownerId', { ownerId })
      .execute();

    if (res.affected <= 0) {
      throw new BadRequestException('Has error when update');
    }
    return {
      message: 'Update successfully',
    };
  }

  async remove(id: number, ownerId: number) {
    const res = await this.petRepository
      .createQueryBuilder()
      .delete()
      .from(Pet)
      .where('id = :id', { id })
      .andWhere('ownerId = :ownerId', { ownerId })
      .execute();
    if (res.affected <= 0) {
      throw new BadRequestException('Has error when update');
    }
    return {
      message: 'Delete successfully',
    };
  }

  // Condition
  async getCondition(petId: number) {
    const petCon = await this.petConRepository.findOne({
      relations: { pet: true },
      where: { petId },
    });
    if (!petCon) {
      const newPetCon = this.petConRepository.create({ petId });
      return await this.petConRepository.save(newPetCon);
    }
    return petCon;
  }

  async updateCondition(
    petId: number,
    updatePetConditionDto: UpdatePetConditionDto,
    files: Array<Express.Multer.File>,
  ) {
    const petCon = await this.petConRepository.findOne({
      where: { petId },
    });
    const folder = 'pet-condition';
    let actualImg = '';
    if (petCon) {
      const { url } =
        files.length > 0 &&
        (await this.cloudinaryService.uploadFile(files[0], folder));
      actualImg = files.length > 0 ? url : '';

      await this.petConRepository.update(
        { petId },
        {
          ...updatePetConditionDto,
          actualImg,
        },
      );
    } else {
      throw new BadRequestException('Invalid pet id');
    }

    return {
      message: 'Update successfully',
    };
  }

  // Vet future
  async findAllTreatment(clinicId: number, query: FilterPetDto) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';
    const status = +query.status === 1 ? IsNull() : undefined
    const [res, total] = await this.petTreatmentRepository.findAndCount({
      order: { createdAt: 'DESC' },
      where: [
        // { clinicId, vetId: status },
        { clinicId, vetId: status ,pet: { name: Like(`%${keyword}%`) } }
      ],
      relations: {
        pet: {
          user: true,
        },
        user: true
      },
      take: limit,
      skip: skip,
    });
    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: petTreatmentData(res),
      total,
      currentPage: page,
      lastPage,
      nextPage,
      prevPage,
    };
  }

  async findOneTreatment(petId: number) {
    const res = await this.petTreatmentRepository.findOne({
      where: { petId: petId },
      relations: {
        pet: {
          user: true,
        },
        user: true
      },
    });
    if (!res) {
      throw new NotFoundException("Pet id is not found")
    }
    return petTreatmentData(res, true)
  }
}

const petTreatmentData = (res: any, isObject: boolean = false) => {
  if (isObject) {
    return transformData(res);
  }
  return res.map((petTreatment: PetTreatment) =>
    transformData(petTreatment),
  );
};

const transformData = (petTreatment: PetTreatment) => {
  return {
    id: petTreatment.id,
    clinicId: petTreatment.clinicId,
    dateAccepted: petTreatment.dateAccepted,
    createdAt: petTreatment.createdAt,
    pet: {
      id: petTreatment?.pet?.id,
      name: petTreatment?.pet?.name,
      species: petTreatment?.pet?.species,
      breed: petTreatment?.pet?.breed,
      gender: petTreatment?.pet?.gender,
      age: petTreatment?.pet?.age,
      weight: petTreatment?.pet?.weight,
      furColor: petTreatment?.pet?.furColor,
      avatar: petTreatment?.pet?.avatar,
      owner: {
        id: petTreatment?.pet?.user?.id,
        email: petTreatment?.pet?.user?.email,
        fullName: petTreatment?.pet?.user?.fullName,
        phone: petTreatment?.pet?.user?.phone
      },
    },
    vet: {
      id: petTreatment?.user?.id,
      email: petTreatment?.user?.email,
      fullName: petTreatment?.user?.fullName,
      phone: petTreatment?.user?.phone
    }
  }
}
