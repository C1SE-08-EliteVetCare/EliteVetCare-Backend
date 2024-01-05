import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment, VetAppointment } from '../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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
        status: 1,
      });
      return this.appointRepository.save(newAppoint);
    } catch (error) {
      throw new BadRequestException('Has error when create');
    }
  }

  async findAll(ownerId: number, query: FilterAppointmentDto) {
    const limit = query.limit || null;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';
    const status = query.status || undefined;

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
      where: { ownerId, servicePackage: ILike(`%${keyword}%`), status },
    });
    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      petOwner: {
        ownerId: res[0]?.user?.id,
        fullName: res[0]?.user?.fullName,
        email: res[0]?.user?.email,
        phone: res[0]?.user?.phone,
      },
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
          user: true,
        },
        clinic: true,
      },
      where: { id },
    });
    return appointmentData(res, true);
  }

  // Vet feature
  async findAllForVet(clinicId: number, query: FilterAppointmentDto) {
    const limit = query.limit || null;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const keyword = query.search || '';
    const status = query.status || undefined;

    const [res, total] = await this.appointRepository.findAndCount({
      order: { appointmentDate: 'DESC' },
      relations: {
        user: true,
        vetAppointment: {user: true}
      },
      take: limit,
      skip: skip,
      where: { clinicId, servicePackage: ILike(`%${keyword}%`), status },
    });
    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: appointmentVetData(res),
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
      throw new NotFoundException('Appointment id is not found');
    }
    return appointmentVetData(res, true);
  }

  async updateStatus(id: number, vetId: number, action: number) {
    // Create new record to accept appointment (include: id of vet accepted)
    const newAccept =
      action === 1 &&
      (await this.vetAppointRepository.save(
        this.vetAppointRepository.create({ vetId }),
      ));

    // Update status and acceptedId
    const appointUpdated = await this.appointRepository.update(
      { id },
      {
        status: action === 1 ? 2 : 3,
        acceptedId: action === 1 ? newAccept.id : null,
      },
    );

    if (appointUpdated.affected <= 0) {
      throw new NotFoundException('Id appointment not found');
    } else {
      const appointment = await this.appointRepository.createQueryBuilder('a')
        .where('a.id=:id', {id})
        .leftJoin('a.clinic', 'clinic')
        .leftJoin('a.vetAppointment', 'vetAppointment')
        .leftJoin('vetAppointment.user', 'vet')
        .addSelect([
          'a.id', 'a.ownerId', 'a.appointmentDate', 'a.appointmentTime',
          'a.servicePackage', 'a.status', 'a.createdAt', 'a.updatedAt', 'clinic.id',
          'clinic.name', 'clinic.logo', 'vetAppointment.id', 'vetAppointment.dateAccepted',
          'vet.id', 'vet.email', 'vet.fullName'
        ])
        .getOne()
      return {
        message: 'Update status successfully',
        appointment: appointment
      };
    }
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

const appointmentVetData = (res: any, isObject: boolean = false) => {
  if (isObject) {
    return transformAppointmentVet(res);
  }
  return res.map((appointment: Appointment) =>
    transformAppointmentVet(appointment),
  );
};

const transformAppointmentVet = (appointment: Appointment) => {
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
      id: appointment.user?.id,
      fullName: appointment.user?.fullName,
      email: appointment.user?.email,
      phone: appointment.user?.phone,
      avatar: appointment.user?.avatar
    },
    vetAppointment: {
      vetId: appointment.vetAppointment?.user?.id,
      fullName: appointment.vetAppointment?.user?.fullName,
      email: appointment.vetAppointment?.user?.email,
      phone: appointment.vetAppointment?.user?.phone,
      dateAccepted: appointment.vetAppointment?.dateAccepted,
    }
  };
};
