import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ForgotDto,
  LoginDto,
  RegisterDto,
  ResetDto,
  VerifyDto,
} from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as argon from 'argon2';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities';
import { Repository } from 'typeorm';
import { MailService } from '../config/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
    private configService: ConfigService,
    private jwt: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email has already registered');
    }
    // generate the password hash
    const hash = await argon.hash(registerDto.password);

    await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          email: registerDto.email,
          password: hash,
          fullName: registerDto.fullName,
          phone: registerDto.phone,
        },
      ])
      .execute();

    // Verify email and save into cache
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = crypto.randomInt(100000, 999999).toString();
    await this.cacheManager.set('verify_otp', otp, 300000);

    await this.mailService.sendEmailConfirmation(registerDto.email, otp);

    return {
      message: 'Register new account successfully',
    };
  }

  async verifyEmail(verifyDto: VerifyDto) {
    const otp = await this.cacheManager.get('verify_otp');
    if (!otp) {
      throw new BadRequestException('OTP has expired');
    }
    if (otp !== verifyDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ operatingStatus: true })
      .where('email = :email', { email: verifyDto.email })
      .execute();

    await this.cacheManager.del('user_otp');
    return {
      message: 'Success verified',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email, operatingStatus: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found or not active');
    }
    const passwordMatched = await argon.verify(
      user.password,
      loginDto.password,
    );
    if (!passwordMatched) {
      throw new UnauthorizedException('Incorrect password');
    }
    const token = await this.generateJwtToken(user.id, user.email);
    await this.updateRtHash(user.id, token.refreshToken);
    return {
      message: 'Login successfully',
      ...token,
    };
  }

  // async googleLogin(req) {}

  async googleAuthRedirect(
    email: string,
    firstName: string,
    lastName: string,
    picture: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { email: email, operatingStatus: true },
    });

    if (!user) {
      const newUser = await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            email: email,
            fullName: `${firstName} ${lastName}`,
            password: '',
            avatar: picture,
            phone: '',
          },
        ])
        .execute();
      const token = await this.generateJwtToken(
        newUser.raw[0].id,
        newUser.raw[0].email,
      );
      return {
        message: 'Create new user and signed in',
        ...token,
      };
    }
    const token = await this.generateJwtToken(user.id, user.email);
    return {
      message: 'Login successfully',
      ...token,
    };
  }

  async forgotPassword(forgotDto: ForgotDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotDto.email },
    });
    if (!user) {
      throw new BadRequestException("Email hasn't been registered");
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    await this.mailService.sendEmailResetPassword(
      forgotDto.email,
      user.fullName,
      otp,
    );

    await this.cacheManager.set('reset_otp', otp, 300000);
    return {
      message: 'Send to your email successfully',
    };
  }

  async resetPassword(resetDto: ResetDto) {
    // Hash the new password
    const hash = await argon.hash(resetDto.password);

    // Get the OTP from cache
    const otp = await this.cacheManager.get('reset_otp');

    // Check if OTP is expired or invalid
    if (!otp || otp !== resetDto.otp) {
      throw new BadRequestException('OTP has expired or Invalid OTP');
    }

    // Update the user's password in the config
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ password: hash })
      .where('email= :email', { email: resetDto.email })
      .execute();

    await this.cacheManager.del('reset_otp');
    return {
      message: 'Reset password successfully',
    };
  }

  async updateRtHash(userId: number, refreshToken: string) {
    const hashedRt = await argon.hash(refreshToken);
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ hashedRt: hashedRt })
      .where('id= :userId', { userId })
      .execute();
  }

  async refreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashedRt, refreshToken);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const newJwtAt = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '30m',
        secret: this.configService.get('JWT_SECRET'),
      },
    );
    return {
      accessToken: newJwtAt,
    };
  }

  async generateJwtToken(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId, // Subject
      email: email,
    };
    const [jwtAt, jwtRt] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '30m',
        secret: this.configService.get('JWT_SECRET'),
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '30d',
        secret: this.configService.get('JWT_SECRET'),
      }),
    ]);

    return {
      accessToken: jwtAt,
      refreshToken: jwtRt,
    };
  }

  async logout(userId: number) {
    try {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ hashedRt: null })
        .where('id= :userId', { userId })
        .andWhere('hashed_rt IS NOT NULL')
        .execute();
      return {
        message: 'Logout successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
