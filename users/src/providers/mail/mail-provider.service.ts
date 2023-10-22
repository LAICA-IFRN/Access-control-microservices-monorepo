import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_TRANSPORT_SERVICE,
      host: process.env.EMAIL_TRANSPORT_HOST,
      port: parseInt(process.env.EMAIL_TRANSPORT_PORT),
      secure: process.env.EMAIL_TRANSPORT_SECURE === 'true' ? true : false,
      auth: {
        user: process.env.EMAIL_ACCOUNT_INVITATION,
        pass: process.env.EMAIL_ACCOUNT_INVITATION_PASSWORD
      }
    });
  }

  async sendMail(to: string) {
    const templatePath = process.env.EMAIL_ACCOUNT_MESSAGE_PATH
    const subject = process.env.EMAIL_ACCOUNT_SUBJECT;
    const htmlContent = fs.readFileSync(templatePath, 'utf-8');

    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_ACCOUNT_FROM,
      to,
      subject,
      html: htmlContent,
    });
  }
}
