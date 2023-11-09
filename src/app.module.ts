import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PetModule } from './pet/pet.module';
import { AppointmentModule } from './appointment/appointment.module';
import { MailModule } from './config/mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../db/data-source';
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ClinicModule } from './clinic/clinic.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
    }),
    MailModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UserModule,
    PetModule,
    AppointmentModule,
    CloudinaryModule,
    FeedbackModule,
    ClinicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    // consumer
    //   .apply(LoggerMiddleware)
    //   .forRoutes({ path: 'pet/pets', method: RequestMethod.GET });
  }
}
