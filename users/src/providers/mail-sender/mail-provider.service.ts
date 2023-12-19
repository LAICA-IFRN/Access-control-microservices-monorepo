import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_TRANSPORT_SERVICE,
      host: process.env.EMAIL_TRANSPORT_HOST,
      port: parseInt(process.env.EMAIL_TRANSPORT_PORT),
      secure: Boolean(process.env.EMAIL_TRANSPORT_SECURE),
      auth: {
        user: process.env.EMAIL_ACCOUNT_INVITATION,
        pass: process.env.EMAIL_ACCOUNT_INVITATION_PASSWORD
      }
    });
  }

  async sendMail(to: string, host: string, userId: string) {
    const subject = process.env.EMAIL_ACCOUNT_SUBJECT;
    const path = `${process.env.OAUTH_SUAP_URL}&redirect_uri=${process.env.OAUTH_SUAP_URL_REDIRECT}?id=${userId}`
    
    try {
      const something = await this.transporter.sendMail({
        from: process.env.EMAIL_ACCOUNT_FROM,
        to,
        subject,
        html: `
          <!DOCTYPE html>
          <html lang="pt-br">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Convite para cadastro no controle de acesso do Laica</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center;">
          
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #333;">Convite para cadastro no controle de acesso do Laica</h2>
              <p style="color: #555; margin-bottom: 20px;">Ao clicar no botão você será redirecionado para realizar o cadastro e ficar disponível para ser vinculado nos ambientes.</p>
              <a href="${path}" style="display: inline-block; padding: 10px 20px; text-decoration: none; background-color: #3a94f5f8; color: #ffffff; border-radius: 4px; transition: background-color 0.3s;">Realizar cadastro</a>
            </div>
          
          </body>
          </html>
        `,
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
