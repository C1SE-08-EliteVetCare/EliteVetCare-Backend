import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationConfig } from './config/validation.config';
import { WebsocketAdapter } from "./modules/gateway/gateway.adapter";
import { AuthService } from "./modules/auth/auth.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "./modules/user/user.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const userService = app.get(UserService)
  const configService = app.get(ConfigService)
  const jwtService = app.get(JwtService)
  const adapter = new WebsocketAdapter(app, userService, configService, jwtService)
  app.useWebSocketAdapter(adapter)
  app.enableCors();

  ValidationConfig(app);

  await app.listen(5000);
}

bootstrap();
