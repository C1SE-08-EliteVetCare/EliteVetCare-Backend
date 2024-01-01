import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto'
import * as argon from 'argon2';
import { User } from "../../../entities";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_SECRET'),
      callbackURL: `${configService.get<string>('SERVER_URL')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const tokenGoogle = crypto.randomBytes(32).toString('hex')

    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      tokenGoogle: tokenGoogle
    };

    const res = await this.userRepository.findOne({
      where: {email: user.email}
    })
    if (!res) {
      const randomPassword = Math.random().toString(36).slice(-8)
      const hashPassword = await argon.hash(randomPassword)

      const newUser = this.userRepository.create({
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        password: hashPassword,
        avatar: user.picture,
        phone: '',
        tokenGoogle: tokenGoogle,
        operatingStatus: true
      });

      await this.userRepository.save(newUser);
    } else {
      res.tokenGoogle = user.tokenGoogle
      await this.userRepository.save(res)
    }

    done(null, user);
  }
}
