import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMailDto {
  @ApiProperty({ example: 'destinataire@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Bienvenue sur MonApp' })
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Voici le contenu du message HTML ou texte.' })
  @IsNotEmpty()
  message: string;
}
