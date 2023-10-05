import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register() {
    return {
      message: 'signed up an user',
    };
  }
}
