import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtStrategyRt } from './strategy/jwt-rt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities';
import { MailModule } from "../config/mail/mail.module";

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}),
    CacheModule.register(),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtStrategyRt, GoogleStrategy],
})
export class AuthModule {}
