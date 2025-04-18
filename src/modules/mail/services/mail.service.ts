import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as dotenv from 'dotenv';
import { SendMailDto } from '../dto/send-mail.dto';

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

  // Compile le template avec les variables contextuelles
  private compileTemplate(templateName: string, context: any) {
    const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const templateContent = fs.readFileSync(filePath, 'utf-8');
    
    // Compilation du template avec Handlebars
    const compiledTemplate = handlebars.compile(templateContent);
    return compiledTemplate(context);
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

    // Utilisation du template dynamique basé sur l'Enum
    const htmlTemplate = this.compileTemplate(dto.template, dto.context);

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
