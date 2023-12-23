import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic, User } from "../../entities";
import { CloudinaryProvider } from '../../config/cloudinary/cloudinary.provider';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';
import { ClinicModule } from "../clinic/clinic.module";
import { ClinicService } from "../clinic/clinic.service";
import { UserService } from "./user.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Clinic]), ClinicModule],
  controllers: [UserController],
  providers: [UserService, CloudinaryProvider, CloudinaryService, ClinicService],
})
export class UserModule {}
