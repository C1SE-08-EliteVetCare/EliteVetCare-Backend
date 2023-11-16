import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CloudinaryService } from '../config/cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Pet, PetCondition, PetTreatment } from '../entities';
import { IsNull, ILike, Repository } from 'typeorm';
import { FilterPetDto } from './dto/filter-pet.dto';
import { UpdatePetConditionDto } from './dto/update-pet-condition.dto';
import { UpdateVetAdviceDto } from './dto/update-vet-advice.dto';

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
      const { url, public_id } = await this.cloudinaryService.uploadFile(file, folder);
      const newPet = await this.petRepository
        .createQueryBuilder()
        .insert()
        .into(Pet)
        .values([
          {
            ...createPetDto,
            avatar: url,
            avatarId: public_id,
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

  async findAll(ownerId: number, query: FilterPetDto): Promise<any> {
    const limit = query.limit || null;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';

    const [res, total] = await this.petRepository.findAndCount({
      relations: {
        petTreatment: {
          clinic: true,
        }
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
      where: { ownerId, name: ILike(`%${keyword}%`) },
    });

    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: petData(res),
      total,
      currentPage: page,
      lastPage,
      nextPage,
      prevPage,
    };
  }

  async findOne(id: number, ownerId: number) {
    const pet = await this.petRepository.findOne({
      where: { id, ownerId },
    });
    if (!pet) {
      throw new NotFoundException('Pet id is not found');
    }
    return pet;
  }

  async update(
    id: number,
    ownerId: number,
    updatePetDto: UpdatePetDto,
    file: Express.Multer.File,
  ) {
    const pet = await this.petRepository.findOne({
      where: { id, ownerId },
    });

    if (file) {
      await this.cloudinaryService.deleteFile(pet.avatarId)
      const folder = 'pet-avatar';
      const { url, public_id } = await this.cloudinaryService.uploadFile(file, folder);
      updatePetDto.avatar = url;
      updatePetDto.avatarId = public_id
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
    try {
      const [petProfile, petCon] = await Promise.all([
        this.petRepository.findOne({
          where: { id: petId },
        }),
        this.petConRepository.find({
          order: { id: 'DESC' },
          take: 30,
          where: { petId },
          select: {
            id: true,
            portion: true,
            weight: true,
            meal: true,
            manifestation: true,
            conditionOfDefecation: true,
            actualImg: true,
            vetAdvice: true,
            recommendedMedicines: true,
            recommendedMeal: true,
            dateUpdate: true,
          },
        }),
      ]);
      return {
        petInfo: petProfile,
        data: petConData(petCon),
      };
    } catch (error) {
      throw new BadRequestException('Has error when get condition');
    }
  }

  async updateCondition(
    petId: number,
    updatePetConditionDto: UpdatePetConditionDto,
    files: Array<Express.Multer.File>,
  ) {
    const folder = 'pet-condition';
    let actualImg = '';

    const { url } =
      files.length > 0 &&
      (await this.cloudinaryService.uploadFile(files[0], folder));
    actualImg = files.length > 0 ? url : '';

    const newPetCon = this.petConRepository.create({
      ...updatePetConditionDto,
      actualImg,
      petId,
    });
    await this.petConRepository.save(newPetCon);

    return {
      message: 'Update successfully',
    };
  }

  // Vet future
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

  async findAllTreatment(clinicId: number, query: FilterPetDto) {
    const limit = query.limit || null;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';
    const status = +query.status === 1 ? IsNull() : undefined;
    const [res, total] = await this.petTreatmentRepository.findAndCount({
      order: { createdAt: 'DESC' },
      where: { clinicId, vetId: status, pet: { name: ILike(`%${keyword}%`) } },
      relations: {
        pet: {
          user: true,
        },
        user: true,
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
        user: true,
      },
    });
    if (!res) {
      throw new NotFoundException('Pet id is not found');
    }
    return petTreatmentData(res, true);
  }

  async updateVetAdvice(
    vetId: number,
    petId: number,
    updateVetAdviceDto: UpdateVetAdviceDto,
  ) {
    const treatment = await this.petTreatmentRepository.findOne({
      where: { petId, vetId },
    });

    if (!treatment) {
      throw new NotFoundException('No treatment records exist for this pet');
    }

    // Update the newest record
    const res = await this.petConRepository
      .createQueryBuilder()
      .update(PetCondition)
      .set({ ...updateVetAdviceDto })
      .where(
        'id = (SELECT id FROM pet_condition WHERE petId = :petId ORDER BY id DESC LIMIT 1)',
        { petId },
      )
      .execute();

    if (res.affected <= 0) {
      throw new BadRequestException('Has error when update');
    }
    return {
      message: 'Update advice successfully',
    };
  }
}

const petTreatmentData = (res: any, isObject: boolean = false) => {
  if (isObject) {
    return transformData(res);
  }
  return res.map((petTreatment: PetTreatment) => transformData(petTreatment));
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
        phone: petTreatment?.pet?.user?.phone,
      },
    },
    vet: {
      id: petTreatment?.user?.id,
      email: petTreatment?.user?.email,
      fullName: petTreatment?.user?.fullName,
      phone: petTreatment?.user?.phone,
    },
  };
};

const petConData = (res: any, isObject: boolean = false) => {
  if (isObject) {
    return transformPetCon(res);
  }
  return res.map((petCon: PetCondition) => transformPetCon(petCon));
};

const transformPetCon = (petCon: PetCondition) => {
  return {
    id: petCon.id,
    portion: petCon.portion,
    weight: petCon.weight,
    meal: petCon.meal,
    manifestation: petCon.manifestation,
    conditionOfDefecation: petCon.conditionOfDefecation,
    actualImg: petCon.actualImg,
    vetAdvice: petCon.vetAdvice,
    recommendedMedicines: petCon.recommendedMedicines,
    recommendedMeal: petCon.recommendedMeal,
    dateUpdate: petCon.dateUpdate,
  };
};

const petData = (res: any, isObject: boolean = false) => {
  if (isObject) {
    return transformPet(res);
  }
  return res.map((pet: Pet) => transformPet(pet));
};

const transformPet = (pet: Pet) => {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    age: pet.age,
    weight: pet.weight,
    furColor: pet.furColor,
    avatar: pet.avatar,
    ownerId: pet.ownerId,
    createdAt: pet.createdAt,
    clinic: {
      id: pet?.petTreatment?.clinic.id,
      name: pet?.petTreatment?.clinic.name,
      city: pet?.petTreatment?.clinic.city,
      district: pet?.petTreatment?.clinic.district,
      streetAddress: pet?.petTreatment?.clinic.streetAddress,
      logo: pet?.petTreatment?.clinic.logo,
    },
  };
};
