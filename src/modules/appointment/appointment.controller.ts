import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/decorator/user.decorator';
import { Clinic, User } from '../../entities';
import { FilterAppointmentDto } from './dto/filter-appointment.dto';
import { RoleGuard } from '../auth/guard/role.guard';
import { EventEmitter2 } from "@nestjs/event-emitter";

@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private eventEmitter: EventEmitter2
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async create(
    @GetUser() user: User,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    const appointment = await this.appointmentService.create(user.id, createAppointmentDto);
    this.eventEmitter.emit('appointment.create', {user, appointment})
    return appointment;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('appointments')
  findAll(
    @GetUser('id') ownerId: number,
    @Query() query: FilterAppointmentDto,
  ) {
    return this.appointmentService.findAll(ownerId, query);
  }

  @UseGuards(new RoleGuard(['Vet']))
  @UseGuards(AuthGuard('jwt'))
  @Get('vet-appointments')
  fillAllForVet(@GetUser('clinic') clinic: Clinic, @Query() query: FilterAppointmentDto) {
    return this.appointmentService.findAllForVet(clinic.id, query)
  }

  @Get('vet-appointments/:id')
  findOneForVet(@Param('id') id: string) {
    return this.appointmentService.findOneForVet(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(+id);
  }

  // Vet feature
  @UseGuards(new RoleGuard(['Vet']))
  @UseGuards(AuthGuard('jwt'))
  @Patch('update-status/:id')
  async updateStatus(
    @Param('id') id: string,
    @GetUser('id') vetId: number,
    @Body('action') action: string,
  ) {
    const res = await this.appointmentService.updateStatus(+id, vetId, +action);
    this.eventEmitter.emit('appointment.updateStatus', res)
    return res;
  }
}
