import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Res
} from "@nestjs/common";
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
  ForgotDto,
  LoginDto,
  RegisterDto, ResendOtpDto,
  ResetDto,
  VerifyDto
} from "./dto/auth.dto";
import { GetUser } from '../user/decorator/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from "../../entities";
import {Response} from 'express'
import { config } from 'dotenv';
import * as process from 'process';

config();

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    if (!req.user) throw new UnauthorizedException('Login failed from google');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @HttpCode(HttpStatus.OK)
  googleAuthRedirect(
    @GetUser('tokenGoogle') token: string,
    @Res() res: Response
  ) {
    res.redirect(`${process.env.CLIENT_URL}/login-success/${token}`)
  }

  @Post('google/login-success')
  @HttpCode(HttpStatus.OK)
  googleLoginSuccess(@Body('tokenGoogle') tokenGoogle: string) {
    return this.authService.googleLoginSuccess(
      tokenGoogle
    );
  }

  @Post('google/response-token')
  responseToken(@Body() body: any, @Res() res: Response) {
    return this.authService.responseToken(body, res)
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt-refresh'))
  refreshToken(
    @GetUser('sub') userId: number,
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(userId, refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  resentOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  logout(@GetUser('id') user: User) {
    return this.authService.logout(user.id);
  }
}
