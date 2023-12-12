import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MailModule } from './config/mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../db/data-source';
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { PetModule } from "./modules/pet/pet.module";
import { AppointmentModule } from "./modules/appointment/appointment.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { ClinicModule } from "./modules/clinic/clinic.module";
import { ChatModule } from "./modules/chat/chat.module";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { MessageModule } from "./modules/message/message.module";

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
    JwtModule.register({
      global: true
    }),
    ChatModule,
    ConversationModule,
    MessageModule
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
