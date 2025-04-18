import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ResentForgotPasswordVerificationCodeDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
