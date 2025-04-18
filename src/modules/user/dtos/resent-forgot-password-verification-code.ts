import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResentForgotPasswordVerificationCodeDto {
  @ApiProperty({ example: 'example@example.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
