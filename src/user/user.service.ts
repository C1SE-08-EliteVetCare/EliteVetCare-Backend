import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon from 'argon2';
import { CloudinaryService } from '../config/cloudinary/cloudinary.service';

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

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<any> {
    const [res, total] = await this.userRepository.findAndCount();
    return {
      data: res,
      total,
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
      const res = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ avatar: url })
        .where('id= :id', { id })
        .execute();

      return {
        message: "Update successfully",
        url
      }
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
