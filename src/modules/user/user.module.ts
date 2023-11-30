import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities';
import { CloudinaryProvider } from '../../config/cloudinary/cloudinary.provider';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, CloudinaryProvider, CloudinaryService],
})
export class UserModule {}
