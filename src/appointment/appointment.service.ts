import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, User, VetAppointment } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FilterAppointmentDto } from './dto/filter-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointRepository: Repository<Appointment>,
    @InjectRepository(VetAppointment)
    private vetAppointRepository: Repository<VetAppointment>,
  ) {}

  create(ownerId: number, createAppointmentDto: CreateAppointmentDto) {
    try {
      const newAppoint = this.appointRepository.create({
        ownerId,
        ...createAppointmentDto,
        status: 'Đang xử lý',
      });
      return this.appointRepository.save(newAppoint);
    } catch (error) {
      throw new BadRequestException('Has error when create');
    }
  }

  async findAll(ownerId: number, query: FilterAppointmentDto) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';

    const [res, total] = await this.appointRepository.findAndCount({
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        appointmentDate: true,
        appointmentTime: true,
        servicePackage: true,
        status: true,
        acceptedId: true,
        createdAt: true,
        updatedAt: true,
      },
      relations: {
        clinic: true,
      },
      take: limit,
      skip: skip,
      where: { ownerId, servicePackage: Like(`%${keyword}%`) },
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
    return this.appointRepository.findOne({
      relations: {
        vetAppointment: true,
        clinic: true
      },
      select: {
        id: true,
        appointmentDate: true,
        appointmentTime: true,
        servicePackage: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { id },
    });
  }

  async updateStatus(id: number, vetId: number, status: number) {
    // Create new record to accept appointment (include: id of vet accepted)
    const newAccept =
      status === 1 &&
      (await this.vetAppointRepository.save(
        this.vetAppointRepository.create({ vetId }),
      ));

    // Update status and acceptedId
    const appointUpdated = await this.appointRepository.update(
      { id },
      {
        status: status === 1 ? 'Đã nhận' : 'Bị từ chối',
        acceptedId: status === 1 ? newAccept.id : null,
      },
    );

    if (appointUpdated.affected <= 0) {
      throw new NotFoundException('Id appointment not found');
    }
    return {
      message: 'Update successfully',
    };
  }
}
