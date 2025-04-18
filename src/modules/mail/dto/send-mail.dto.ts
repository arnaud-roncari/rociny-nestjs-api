import { IsEmail, IsEnum, IsObject, IsString } from 'class-validator';
import { MailTemplate } from '../enums/mail-template.enum';

export class SendMailDto {
  @IsEmail()
  to: string;

  @IsEnum(MailTemplate)
  template: MailTemplate;

  @IsString()
  subject: string;

  @IsObject()
  context: Record<string, any>;
}
