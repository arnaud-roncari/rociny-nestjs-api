import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResentUpdateEmailVerificationCodeDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly new_email: string;
}
