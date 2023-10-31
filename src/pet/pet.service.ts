import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CloudinaryService } from '../config/cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Pet, PetCondition } from '../entities';
import { Like, Repository } from 'typeorm';
import { FilterPetDto } from './dto/filter-pet.dto';
import { UpdatePetConditionDto } from './dto/update-pet-condition.dto';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(PetCondition)
    private petConRepository: Repository<PetCondition>,
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

  async findAll(ownerId: number, query: FilterPetDto): Promise<any> {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';

    const [res, total] = await this.petRepository.findAndCount({
      order: { name: 'ASC' },
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
      const { url } = files.length > 0 && (await this.cloudinaryService.uploadFile(files[0], folder));
      actualImg = files.length > 0 ? url : '';

      const res = await this.petConRepository.update(
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
}
