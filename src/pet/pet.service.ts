import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CloudinaryService } from '../config/cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Pet } from '../entities';
import { Like, Repository } from 'typeorm';
import { FilterPetDto } from './dto/filter-pet.dto';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
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

  findOne(id: number) {
    return `This action returns a #${id} pet`;
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
}
