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
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(registerDto.password);
      // save the new user in the DB
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hash,
          user_name: registerDto.username,
          phone: registerDto.phone,
          operating_status: false,
          role_id: 2,
        },
      });
      delete user.password;

      // Verify email and save into cache
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.cacheManager.set('verify_otp', otp, 300000);

      await this.mailerService.sendMail({
        to: registerDto.email,
        from: 'EliteVetCare" <noreply@elitevetcare.com>',
        subject: 'Vui lòng xác nhận địa chỉ email của bạn - EliteVetCare',
        template: './verifyEmail',
        context: { otp: otp },
      });

      const token = await this.generateJwtToken(user.id, user.email);
      return {
        ...token,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('This email already exist');
        }
      }
      throw error;
    }
  }

  async verifyEmail(verifyDto: VerifyDto) {
    const otp = await this.cacheManager.get('verify_otp');
    if (!otp) {
      throw new BadRequestException('OTP has expired');
    }
    if (otp !== verifyDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }
    await this.prisma.user.update({
      where: {
        email: verifyDto.email,
      },
      data: { operating_status: true },
    });
    await this.cacheManager.del('user_otp');
    return {
      message: 'Success verified',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email, operating_status: true },
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
    const user = await this.prisma.user.findUnique({
      where: { email: email, operating_status: true },
    });
    if (!user) {
      const newUser = await this.prisma.user.create({
        data: {
          email: email,
          user_name: '',
          first_name: firstName,
          last_name: lastName,
          password: '',
          avatar: picture,
          phone: '',
          operating_status: true,
          role_id: 2,
        },
      });
      const token = await this.generateJwtToken(newUser.id, newUser.email);
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
    const user = await this.prisma.user.findUnique({
      where: { email: forgotDto.email },
    });
    if (!user) {
      throw new BadRequestException("Email hasn't been registered");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.mailerService.sendMail({
      to: forgotDto.email,
      from: 'EliteVetCare" <noreply@elitevetcare.com>',
      subject: 'Yêu cầu đặt lại mật khẩu mới - EliteVetCare',
      template: './forgotPassword',
      context: {
        otp: otp,
        fullName: user.user_name || `${user.first_name} ${user.last_name}`,
      },
    });
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

    // Update the user's password in the database
    await this.prisma.user.update({
      data: { password: hash },
      where: { email: resetDto.email },
    });
    await this.cacheManager.del('reset_otp');
    return {
      message: 'Reset password successfully',
    };
  }

  async updateRtHash(userId: number, refreshToken: string) {
    const hashedRt = await argon.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashed_rt: hashedRt,
      },
    });
  }

  async refreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.hashed_rt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashed_rt, refreshToken);
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
    await this.prisma.user.update({
      where: {
        id: userId,
        hashed_rt: { not: null },
      },
      data: { hashed_rt: null },
    });
    return true;
  }
}
