import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as dotenv from 'dotenv';
import { MailTemplate } from '../enums/mail-template.enum';

dotenv.config();

type SendMailInput = {
  to: string;
  template: MailTemplate;
  context: Record<string, any>;
};

@Injectable()
export class MailService {
  private oAuth2Client;

  private subjectMap: Record<MailTemplate, string> = {
    [MailTemplate.VERIFICATION_CODE]: 'Vérification de votre compte Rociny',
    [MailTemplate.RESET_PASSWORD]: 'Votre code de réinitialisation de mot de passe - Rociny',
    [MailTemplate.WELCOME]: 'Bienvenue sur Rociny',
  };

  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
    );
    this.oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
  }

  // Compile the template with the context variables
  private compileTemplate(templateName: string, context: any) {
    const filePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
    const templateContent = fs.readFileSync(filePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateContent);
    return compiledTemplate(context);
  }

  async sendMail({ to, template, context }: SendMailInput) {
    const subject = this.subjectMap[template];

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

    const htmlTemplate = this.compileTemplate(template, context);

    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    return { messageId: info.messageId, response: info.response };
  }
}
