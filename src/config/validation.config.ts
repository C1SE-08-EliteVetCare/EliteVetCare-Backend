import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const ValidationConfig = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      exceptionFactory: (validationError: ValidationError[]) => {
        const errors = validationError.map((error) => ({
          [error.property]: Object.values(error.constraints)[0],
        }));
        return new BadRequestException(errors);
      },
    }),
  );
};