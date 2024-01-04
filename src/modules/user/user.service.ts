import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../entities';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon from 'argon2';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';
import { FilterUserDto } from './dto/filter-user.dto';
import { ClinicService } from '../clinic/clinic.service';
import { ContactUserDto } from "./dto/contact-user.dto";
import { MailService } from "../../config/mail/mail.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(ClinicService)
    private readonly clinicService: ClinicService,
    private mailService: MailService,
  ) {}

  getCurrentUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      gender: user.gender,
      city: user.city,
      district: user.district,
      ward: user.ward,
      streetAddress: user.streetAddress,
      birthYear: user.birthYear,
      avatar: user.avatar,
      phone: user.phone,
      clinic: user.clinic,
      role: user.role,
    };
  }

  async findAll(query: FilterUserDto): Promise<any> {
    const limit = query.limit || null;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';
    const [res, total] = await this.userRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
      where: { fullName: ILike(`%${keyword}%`) },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        gender: true,
        city: true,
        district: true,
        ward: true,
        streetAddress: true,
        birthYear: true,
        avatar: true,
        operatingStatus: true,
        createdAt: true,
      },
      relations: {
        role: true,
        clinic: true,
      },
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
    const user = this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User id is not found');
    }
    return user;
  }

  findByEmail(email: string) {
    const user = this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User id is not found');
    }
    return user;
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
      const { url, public_id } = await this.cloudinaryService.uploadFile(
        file,
        folder,
      );

      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (user.avatarId !== null) {
        // Delete image in database
        await this.cloudinaryService.deleteFile(user.avatarId);
      }

      // Update avatar url into database
      user.avatar = url;
      user.avatarId = public_id;

      await this.userRepository.save(user);

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

  async toggleActivateUser(userId: number, action: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User is not found');
    if (action === 'activate') {
      user.operatingStatus = true;
    } else if (action === 'deactivate') {
      user.operatingStatus = false;
    } else {
      throw new BadRequestException('Invalid action');
    }
    await this.userRepository.save(user);
    return {
      message:
        action === 'activate'
          ? 'Activate user successfully'
          : 'Deactivate user successfully',
    };
  }

  async saveUser(user: User) {
    return this.userRepository.save(user);
  }

  async findAllVet(query: FilterUserDto) {
    const keyword = query.search || '';
    const user = await this.userRepository.find({
      where: { roleId: 3, fullName: ILike(`%${keyword}%`) },
      relations: {
        clinic: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User id is not found');
    }
    return user;
  }

  async findAllVetInClinic(clinicId: number) {
     return await this.userRepository.find({
      where: { roleId: 3, clinicId },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });
  }

  async recommendVet(userId: number) {
    const suggestedDoctors = [];

    const [allClinics, user] = await Promise.all([
      this.clinicService.findAll(),
      this.userRepository.findOne({
        where: {id: userId},
        relations: {appointments: true},
        select: {appointments: true}
      })
    ])

    // Tạo danh sách phòng khám mà người dùng đã từng đặt cuộc hẹn
    const clinicIdsWithAppointments = [...new Set(user.appointments.map(appointment => appointment.clinicId))];

    // Tạo danh sách phòng khám mà người dùng chưa từng đặt cuộc hẹn
    const clinicIdsWithoutAppointments = allClinics
      .map(clinic => clinic.id)
      .filter(clinicId => !clinicIdsWithAppointments.includes(clinicId));

    for (const clinicId of clinicIdsWithAppointments) {
      const vet = await this.getVetsInClinic(clinicId)
      vet !== null && suggestedDoctors.push(vet);
    }

    for (const clinicId of clinicIdsWithoutAppointments) {
      const vet = await this.getVetsInClinic(clinicId)
      vet !== null && suggestedDoctors.push(vet);
    }

    return suggestedDoctors;
  }

  async getVetsInClinic(clinicId: number) {
    return this.userRepository.createQueryBuilder('user')
      .where('user.roleId = :roleId', { roleId: 3 })
      .andWhere('user.clinicId = :clinicId', { clinicId })
      .leftJoin('user.clinic', 'clinic')
      .leftJoin('clinic.feedbacks', 'feedback')
      .addSelect(['ROUND(AVG(COALESCE(feedback.rating, 0)), 1) AS averageRating'])
      .addSelect(['user.id', 'user.fullName', 'user.avatar', 'user.email', 'clinic.id', 'clinic.name', 'clinic.city', 'clinic.district', 'clinic.ward', 'clinic.streetAddress', 'clinic.logo'])
      .groupBy('user.id, clinic.id')
      .orderBy('RANDOM()')
      .getRawOne().then(result => ({
        id: result.user_id,
        fullName: result.user_full_name,
        avatar: result.user_avatar,
        email: result.user_email,
        clinic: {
          id: result.clinic_id,
          name: result.clinic_name,
          city: result.clinic_city,
          district: result.clinic_district,
          ward: result.clinic_ward,
          streetAddress: result.clinic_street_address,
          averageRating: result.averagerating == 0.0 ? 0 : result.averagerating,
        },
      }));
  }

  async sendContact(contactUserDto: ContactUserDto) {
    const {fullName, email, phone, content} = contactUserDto
    const emails = await this.userRepository.find({
      where: { roleId: 1 },
      select: ['email'],
    })
    const formatEmails = emails.map(item => item.email).toString()
    await this.mailService.sendEmailContact(email, fullName, phone, content, formatEmails)

    return {
      message: 'Send successfully',
    };
  }

  async updateClinic(userId: number, clinicId: number) {
    const user = await this.userRepository.findOne({
      where: {id: userId}
    })
    if (!user) {
      throw new NotFoundException("User is not found")
    }
    user.clinicId = clinicId
    await this.userRepository.save(user)
    return {
      message: "Update clinic successfully"
    }
  }
}
