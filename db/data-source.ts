import { DataSource, DataSourceOptions } from 'typeorm';
import {
  Appointment,
  Clinic,
  Feedback,
  Inbox,
  Message,
  Pet,
  PetCondition,
  PetTreatment,
  Role,
  User,
  VetAppointment,
} from '../src/entities';
import { config } from 'dotenv';
import * as process from 'process';

config();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
  synchronize: true,
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
