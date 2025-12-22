import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResentRegisterVerificationCodeDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
