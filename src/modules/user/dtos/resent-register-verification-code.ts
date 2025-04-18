import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ResentRegisterVerificationCodeDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
