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
import { User } from '../entities';
import { FilterAppointmentDto } from './dto/filter-appointment.dto';
import { RoleGuard } from '../auth/guard/role.guard';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  create(
    @GetUser('id') ownerId: number,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.create(ownerId, createAppointmentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('appointments')
  findAll(
    @GetUser('id') ownerId: number,
    @Query() query: FilterAppointmentDto,
  ) {
    return this.appointmentService.findAll(ownerId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(+id);
  }

  // Vet feature
  @UseGuards(AuthGuard('jwt'))
  @Patch('update-status/:id')
  updateStatus(
    @Param('id') id: string,
    @GetUser('id') vetId: number,
    @Body('status') status: string,
  ) {
    return this.appointmentService.updateStatus(+id, vetId, +status);
  }
}
