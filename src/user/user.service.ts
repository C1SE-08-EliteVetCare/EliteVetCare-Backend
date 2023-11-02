import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon from 'argon2';
import { CloudinaryService } from '../config/cloudinary/cloudinary.service';
import { FilterPetDto } from '../pet/dto/filter-pet.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  getCurrentUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      gender: user.gender,
      city: user.city,
      district: user.district,
      streetAddress: user.streetAddress,
      birthYear: user.birthYear,
      avatar: user.avatar,
      phone: user.phone,
      clinic: user.clinic,
      role: user.role,
    };
  }

  async findAll(query: FilterPetDto): Promise<any> {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';
    const [res, total] = await this.userRepository.findAndCount({
      order: { createdAt: 'ASC' },
      take: limit,
      skip: skip,
      where: { fullName: Like(`%${keyword}%`) },
      select: {
        id: true, email: true, fullName: true, phone: true, gender: true, city: true, district: true, ward: true,
        birthYear: true, avatar: true, operatingStatus: true, createdAt: true
      },
      relations: {
        role: true,
        clinic: true
      }
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
    return `This action returns a #${id} user`;
  }

  async updateProfile(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const res = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ ...updateUserDto })
      .where('id= :id', { id })
      .execute();
    if (res.affected === 0) {
      throw new NotFoundException('User is not found');
    }
    return {
      message: 'Update successfully',
    };
  }

  async uploadAvatar(id: number, file: Express.Multer.File) {
    try {
      // Upload avatar to cloudinary
      const folder = 'user-avatar';
      const { url } = await this.cloudinaryService.uploadFile(file, folder);

      // Update avatar url into database
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ avatar: url })
        .where('id= :id', { id })
        .execute();

      return {
        message: 'Update successfully',
        url,
      };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User is not found');
    }
    // Compare password
    const passwordMatched = await argon.verify(
      user.password,
      changePasswordDto.oldPassword,
    );
    if (!passwordMatched) {
      throw new BadRequestException('Incorrect old password');
    }

    // Hash new password and save to database
    user.password = await argon.hash(changePasswordDto.newPassword);
    await this.userRepository.save(user);

    return {
      message: 'Change password successfully',
    };
  }

  async updateRole(userId: number, newRoleId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User is not found');
    user.roleId = newRoleId;
    await this.userRepository.save(user);
    return {
      message: 'Update role successfully',
    };
  }
}
