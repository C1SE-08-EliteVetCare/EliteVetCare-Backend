import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment, VetAppointment } from "../entities";

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, VetAppointment])],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
