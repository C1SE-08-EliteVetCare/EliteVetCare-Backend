import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment, VetAppointment } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from "typeorm";
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
      relations: {
        user: true,
        vetAppointment: {
          user: true,
        },
        clinic: true,
      },
      take: limit,
      skip: skip,
      where: { ownerId, servicePackage: ILike(`%${keyword}%`) },
    });
    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: appointmentData(res),
      total,
      currentPage: page,
      lastPage,
      nextPage,
      prevPage,
    };
  }

  async findOne(id: number) {
    const res = await this.appointRepository.findOne({
      relations: {
        vetAppointment: {
          user: true
        },
        clinic: true,
      },
      where: { id },
    });
    return appointmentData(res, true);
  }

  // Vet feature
  async findAllForVet(clinicId: number, query: FilterAppointmentDto) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';

    const [res, total] = await this.appointRepository.findAndCount({
      order: { createdAt: 'DESC' },
      relations: {
        user: true,
      },
      take: limit,
      skip: skip,
      where: { clinicId, servicePackage: ILike(`%${keyword}%`) },
    });
    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: appointmentData(res),
      total,
      currentPage: page,
      lastPage,
      nextPage,
      prevPage,
    };
  }

  async findOneForVet(id: number) {
    const res = await this.appointRepository.findOne({
      relations: {
        user: true,
      },
      where: { id: id },
    });
    if (!res) {
      throw new NotFoundException("Appointment id is not found")
    }
    return appointmentData(res, true)
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

const appointmentData = (res: any, isObject: boolean = false) => {
  if (isObject) {
    return transformAppointment(res);
  }
  return res.map((appointment: Appointment) =>
    transformAppointment(appointment),
  );
};

const transformAppointment = (appointment: Appointment) => {
  return {
    id: appointment.id,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    servicePackage: appointment.servicePackage,
    status: appointment.status,
    acceptedId: appointment.acceptedId,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
    petOwner: {
      ownerId: appointment?.user?.id,
      fullName: appointment?.user?.fullName,
      email: appointment?.user?.email,
      phone: appointment?.user?.phone,
    },
    vetAppointment: {
      vetId: appointment.vetAppointment?.user?.id,
      fullName: appointment.vetAppointment?.user?.fullName,
      email: appointment.vetAppointment?.user?.email,
      phone: appointment.vetAppointment?.user?.phone,
      dateAccepted: appointment.vetAppointment?.dateAccepted,
    },
    clinic: {
      id: appointment.clinic?.id,
      name: appointment.clinic?.name,
      city: appointment.clinic?.city,
      district: appointment.clinic?.district,
      ward: appointment.clinic?.ward,
      streetAddress: appointment.clinic?.streetAddress,
      logo: appointment.clinic?.logo,
    },
  };
};
