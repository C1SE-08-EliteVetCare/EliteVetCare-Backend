import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register() {
    return this.authService.register();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login() {
    return 'Login';
  }
}
