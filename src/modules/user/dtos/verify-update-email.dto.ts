import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyUpdateEmailDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly new_email: string;

  @IsNumber()
  @IsNotEmpty()
  readonly code: number;
}
