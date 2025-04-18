import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyForgotPasswordDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsNumber()
  @IsNotEmpty()
  readonly code: number;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
