import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';

@Module({
  controllers: [],
  providers: [MailService],
  exports: [MailService],
})
export class Email {}
