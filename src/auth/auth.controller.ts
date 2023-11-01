import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards, UsePipes, ValidationPipe
} from "@nestjs/common";
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
  ForgotDto,
  LoginDto,
  RegisterDto,
  ResetDto,
  VerifyDto,
} from './dto/auth.dto';
import { GetUser } from '../user/decorator/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from "../entities";

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

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @HttpCode(HttpStatus.OK)
  googleAuthRedirect(
    @GetUser('email') email: string,
    @GetUser('firstName') firstName: string,
    @GetUser('lastName') lastName: string,
    @GetUser('picture') picture: string,
  ) {
    return this.authService.googleAuthRedirect(
      email,
      firstName,
      lastName,
      picture,
    );
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt-refresh'))
  refreshToken(
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(refreshToken);
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  logout(@GetUser('id') user: User) {
    return this.authService.logout(user.id);
  }
}
