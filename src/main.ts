import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationConfig } from './config/validation.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  ValidationConfig(app);

  await app.listen(5000);
}

bootstrap();
