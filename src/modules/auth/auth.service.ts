import {
  BadRequestException,
  ForbiddenException, HttpException, HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import {
  ForgotDto,
  LoginDto,
  RegisterDto, ResendOtpDto,
  ResetDto,
  VerifyDto
} from "./dto/auth.dto";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as argon from 'argon2';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities';
import { Repository } from 'typeorm';
import { MailService } from '../../config/mail/mail.service';
import {Response} from "express";

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

    const newUser = this.userRepository.create({
      email: registerDto.email,
      password: hash,
      fullName: registerDto.fullName,
      phone: registerDto.phone,
    });
    await this.userRepository.save(newUser);

    // Verify email and save into cache
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = crypto.randomInt(100000, 999999).toString();
    await this.cacheManager.set(`verify_otp-${newUser.id}`, otp, 300000);

    await this.mailService.sendEmailConfirmation(registerDto.email, otp);

    return {
      message: 'Register new account successfully',
    };
  }

  async verifyEmail(verifyDto: VerifyDto) {
    const user = await this.userRepository.findOne({
      where: {email: verifyDto.email}
    })
    if (!user) {
      throw new NotFoundException(
        'The email sent does not match the registered email',
      );
    }

    const otp = await this.cacheManager.get(`verify_otp-${user.id}`);
    if (!otp) {
      throw new BadRequestException('OTP has expired');
    }
    if (otp !== verifyDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }
    user.operatingStatus = true;
    await this.userRepository.save(user)

    await this.cacheManager.del(`verify_otp-${user.id}`);
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

  async googleLoginSuccess(
    tokenGoogle: string
  ) {
    const user = await this.userRepository.findOne({
      where: { tokenGoogle: tokenGoogle },
    });
    if (!user) {
      throw new NotFoundException("User is not found")
    }

    if (user && user.operatingStatus === false) {
      throw new BadRequestException("The account has been locked")
    }

    const token = await this.generateJwtToken(user.id, user.email);
    await this.updateRtHash(user.id, token.refreshToken);
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

    await this.cacheManager.set(`reset_otp-${user.id}`, otp, 300000);
    return {
      message: 'Send to your email successfully',
    };
  }

  async resetPassword(resetDto: ResetDto) {
    // Hash the new password
    const hash = await argon.hash(resetDto.password);

    // Get user
    const user = await this.userRepository.findOne({
      where: {email: resetDto.email}
    })
    if (!user) {
      throw new NotFoundException(
        'The email sent does not match the registered email',
      );
    }

    // Get the OTP from cache
    const otp = await this.cacheManager.get(`reset_otp-${user.id}`);

    // Check if OTP is expired or invalid
    if (!otp) {
      throw new BadRequestException('OTP has expired');
    }
    if (otp !== resetDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Update the user's password in the config
    user.password = hash
    await this.userRepository.save(user)

    await this.cacheManager.del(`reset_otp-${user.id}`);
    return {
      message: 'Reset password successfully',
    };
  }

  async resendOtp(resendOtp: ResendOtpDto) {
    const user = await this.userRepository.findOne({
      where: { email: resendOtp.email },
    });
    if (!user) {
      throw new BadRequestException("Email hasn't been registered");
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    if (resendOtp.type === 1) {
      await this.mailService.sendEmailConfirmation(
        resendOtp.email,
        otp,
      );
      await this.cacheManager.set(`verify_otp-${user.id}`, otp, 300000);
    } else {
      await this.mailService.sendEmailResetPassword(
        resendOtp.email,
        user.fullName,
        otp,
      );
      await this.cacheManager.set(`reset_otp-${user.id}`, otp, 300000);
    }

    return {
      message: 'Send to your email successfully',
    };
  }

  async updateRtHash(userId: number, refreshToken: string) {
    const salt = Buffer.from(
      this.configService.get<string>('SALT_KEY'),
      'base64',
    );
    const hashedRt = await argon.hash(refreshToken, {salt});
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
    const salt = Buffer.from(
      this.configService.get<string>('SALT_KEY'),
      'base64',
    );
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException("User is not found")
    }

    const matchedRt = await argon.verify(user.hashedRt, refreshToken, {salt})
    if (!matchedRt) throw new ForbiddenException('Access Denied');

    const newJwtAt = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '30m',
        secret: this.configService.get('JWT_AT_SECRET'),
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
        expiresIn: '3h',
        secret: this.configService.get('JWT_AT_SECRET'),
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '30d',
        secret: this.configService.get('JWT_RT_SECRET'),
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

  async responseToken(body: any, res: Response) {
    const user = await this.userRepository.findOne({
      where: { email: body.email }
    })
    if (!user) {
      const hashPassword = await argon.hash(body.password)

      const newUser = this.userRepository.create({
        email: body.email,
        fullName: body.fullName,
        password: hashPassword,
        phone: '',
        operatingStatus: true
      });
      await this.userRepository.save(newUser);

      const token = await this.generateJwtToken(newUser.id, newUser.email);
      await this.updateRtHash(newUser.id, token.refreshToken);
      return res.status(HttpStatus.CREATED).json({
        message: "Create new account successfully",
        ...token
      })
    }
    const token = await this.generateJwtToken(user.id, user.email);
    await this.updateRtHash(user.id, token.refreshToken);
    return res.status(HttpStatus.OK).json({
      message: "Login successfully",
      ...token
    })
  }

  async handleVerifyToken(token: string) {
    try {
      const payload = await this.jwt.verify(token, {
        secret: this.configService.get('JWT_AT_SECRET'),
      });
      return this.userRepository.findOne({
        where: {id: payload['sub']}
      });
    } catch (e) {
      throw new UnauthorizedException(
        {
          message: "Unauthorized",
          statusCode: HttpStatus.UNAUTHORIZED,
        },
      );
    }
  }
}


