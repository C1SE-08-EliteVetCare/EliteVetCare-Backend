import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationConfig } from './config/validation.config';

declare const module: any;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  ValidationConfig(app);

  await app.listen(5000);
}

bootstrap();
