import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import {
  Appointment,
  Clinic, Feedback,
  Inbox,
  Message,
  Pet,
  PetCondition,
  PetTreatment,
  Role,
  User,
  VetAppointment
} from "../src/entities";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [
          User,
          Role,
          Clinic,
          Pet,
          PetCondition,
          PetTreatment,
          Appointment,
          VetAppointment,
          Inbox,
          Message,
          Feedback,
        ],
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
        ssl: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      })
    }),
  ],
})
export class DatabaseModule {}