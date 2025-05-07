import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { EmailTemplate } from './enums/email-template.enum';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class EmailService implements OnModuleInit {
  /**
   * Static OAuth2 client used to authenticate with Gmail API
   */
  static client: OAuth2Client;

  /**
   * Static nodemailer transporter to send emails
   */
  static transporter: nodemailer.Transporter;

  /**
   * Subject lines associated with each email template type
   */
  private subjects: Record<EmailTemplate, string> = {
    [EmailTemplate.VERIFICATION_CODE]: 'Vérification de votre compte Rociny',
    [EmailTemplate.RESET_PASSWORD]:
      'Votre code de réinitialisation de mot de passe - Rociny',
    [EmailTemplate.WELCOME]: 'Bienvenue sur Rociny',
  };

  /**
   * Lifecycle hook that runs once the module is initialized.
   * Initializes the OAuth2 client and the nodemailer transporter.
   */
  async onModuleInit() {
    if (!EmailService.client) {
      EmailService.client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
      );
      EmailService.client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });
    }

    if (!EmailService.transporter) {
      const accessToken = await EmailService.client.getAccessToken();

      EmailService.transporter = nodemailer.createTransport({
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
    }
  }

  /**
   * Compiles an HTML email template using Handlebars
   *
   * @param templateName - Name of the template file (without extension)
   * @param context - Data context to inject into the template
   * @returns Rendered HTML string
   */
  private compileTemplate(templateName: string, context: any) {
    const filePath = path.join(
      __dirname,
      '..',
      'templates',
      `${templateName}.hbs`,
    );
    const templateContent = fs.readFileSync(filePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateContent);
    return compiledTemplate(context);
  }

  /**
   * Sends an email to a given recipient using a specified template and context
   *
   * @param to - Recipient email address
   * @param template - Template enum used to choose subject and layout
   * @param context - Variables to inject into the email template
   */
  async sendEmail(to: string, template: EmailTemplate, context: any) {
    const subject = this.subjects[template];
    const html = this.compileTemplate(template, context);

    const options = {
      from: `"Rociny" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: html,
    };

    await EmailService.transporter.sendMail(options);
  }
}
