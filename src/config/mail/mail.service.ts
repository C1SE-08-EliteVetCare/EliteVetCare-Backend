import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../../entities';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailConfirmation(email: string, otp: string) {
    await this.mailerService.sendMail({
      to: email,
      from: 'EliteVetCare" <noreply@elitevetcare.com>',
      subject: 'Vui lòng xác nhận địa chỉ email của bạn - EliteVetCare',
      template: './verifyEmail',
      context: { otp: otp },
    });
  }

  async sendEmailResetPassword(email: string, fullName: string, otp: string) {
    await this.mailerService.sendMail({
      to: email,
      from: 'EliteVetCare" <noreply@elitevetcare.com>',
      subject: 'Yêu cầu đặt lại mật khẩu mới - EliteVetCare',
      template: './forgotPassword',
      context: {
        otp: otp,
        fullName: fullName,
      },
    });
  }
}
