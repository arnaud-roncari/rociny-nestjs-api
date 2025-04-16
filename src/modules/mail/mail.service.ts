import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { SendMailDto } from './dto/send-mail.dto';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MailService {
  private oAuth2Client;

  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
    );
    this.oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
  }

  async sendMail(dto: SendMailDto) {
    const accessToken = await this.oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const htmlTemplate = `
      <h2>${dto.subject}</h2>
      <p>${dto.message}</p>
    `;

    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
      to: dto.to,
      subject: dto.subject,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    return { messageId: info.messageId, response: info.response };
  }
}
