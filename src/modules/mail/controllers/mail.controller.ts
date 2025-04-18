import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { MailService } from '../services/mail.service';
import { SendMailDto } from '../dto/send-mail.dto';
import { MailTemplate } from '../enums/mail-template.enum';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  @ApiOperation({
    summary: 'Send an email with a specified template',
  })
  @ApiBody({
    description: 'Mail data to be sent with the selected template',
    type: SendMailDto,
    examples: {
      'application/json': {
        value: {
          to: 'loulounav78@gmail.com',
          subject: 'Welcome to Our App Rociny',
          template: MailTemplate.WELCOME,
          context: {
            username: 'Loris',
            registrationDate: '2025-04-18',
          },
        },
      },
    },
  })
  async sendMail(@Body() sendMailDto: SendMailDto) {
    return await this.mailService.sendMail(sendMailDto);
  }
}
