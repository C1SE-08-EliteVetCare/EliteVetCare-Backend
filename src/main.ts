import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ValidationConfig } from './config/validation.config';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  ValidationConfig(app);

  await app.listen(5000);

}

bootstrap();
