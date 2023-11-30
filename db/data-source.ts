import { DataSource, DataSourceOptions } from 'typeorm';
import {
  Appointment,
  Clinic,
  Feedback,
  Message,
  Pet,
  PetCondition,
  PetTreatment,
  Role,
  User,
  VetAppointment
} from "../src/entities";
import { config } from 'dotenv';
import * as process from 'process';
import { SeederOptions } from "typeorm-extension";
import { Room } from "../src/entities/room.entity";
import { ConnectedUser } from "../src/entities/connected-user.entity";
import { JoinedRoom } from "../src/entities/joined-room.entity";

config();
export const dataSourceOptions: DataSourceOptions & SeederOptions = {
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
    Message,
    Feedback,
    Room,
    ConnectedUser,
    JoinedRoom,
    Message
  ],
  migrations: ['dist/db/migrations/*.js'],
  seeds: ['dist/db/seeds/*.seeder.js'],
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
