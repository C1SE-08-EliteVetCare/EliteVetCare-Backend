import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from '../entities';
import { Equal, ILike, Repository } from 'typeorm';
import { FilterFeedbackDto } from './dto/filter-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(userId: number, createFeedbackDto: CreateFeedbackDto) {
    try {
      const newFeedback = this.feedbackRepository.create({
        ...createFeedbackDto,
        userId,
      });
      await this.feedbackRepository.save(newFeedback);
      return {
        message: 'Create successfully',
      };
    } catch (error) {
      throw new BadRequestException('Has error when create');
    }
  }

  async findAll(query: FilterFeedbackDto) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    // const keyword = query.search || undefined;
    // const rating = query.rating || undefined;
    const [res, total] = await this.feedbackRepository.findAndCount({
      relations: {
        user: true,
      },
      select: {
        id: true,
        subject: true,
        content: true,
        rating: true,
        createdAt: true,
        user: { id: true, email: true, fullName: true, phone: true },
      },
      where: {
        subject: query.search && ILike(`%${query.search}%`),
        user: { fullName: query.search && ILike(`%${query.search}`) },
        rating: query.rating && Equal(query.rating),
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
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

  async findAllCurrent(userId: number, query: FilterFeedbackDto) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const [res, total] = await this.feedbackRepository.findAndCount({
      select: {
        id: true,
        subject: true,
        content: true,
        rating: true,
        createdAt: true,
      },
      where: {
        userId,
        rating: query.rating && Equal(query.rating),
        subject: query.search && ILike(`%${query.search}%`),
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
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
    return `This action returns a #${id} feedback`;
  }

  async update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    const res = await this.feedbackRepository.update(
      { id },
      {
        ...updateFeedbackDto,
      },
    );
    if (res.affected <= 0) {
      throw new NotFoundException('Feedback id is not found');
    }
    return {
      message: 'Update successfully',
    };
  }

  async remove(id: number) {
    const res = await this.feedbackRepository.delete(id);
    if (res.affected <= 0) {
      throw new NotFoundException('Feedback id is not found');
    }
    return {
      message: 'Delete successfully',
    };
  }
}
