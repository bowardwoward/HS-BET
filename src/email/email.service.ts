/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { EnvService } from '@/env/env.service';
import { UserService } from '@/user/user.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

@Injectable()
export class EmailService {
  private nodeMailer: Mail;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: EnvService,
    private readonly userService: UserService,
  ) {
    this.nodeMailer = createTransport({
      host: configService.get('MAIL_HOST'),
      port: configService.get('MAIL_PORT'),
      secure: false,
    });
  }

  public sendMail(opts: Mail.Options) {
    new Logger().log('Email sent to ', opts.to);
    return this.nodeMailer.sendMail(opts);
  }

  public async decodeToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }

      return '';
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Token expired');
      }

      throw new BadRequestException('Bad Token');
    }
  }

  public async sendResetLink(email: string) {
    const payload = { email };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '30m',
    });
    const user = await this.userService.getUserByUsername(email);
    await this.userService.updateToken(user?.id || '', {
      resetToken: token,
    });
    const url = `${this.configService.get('EMAIL_PASSWORD_RESET_URL')}?token=${token}`;

    const text = `Hi, \nTo reset your password, click here: ${url}`;

    return this.sendMail({
      to: email,
      from: 'support@bet.com',
      subject: 'Reset Password',
      text,
    });
  }
}
