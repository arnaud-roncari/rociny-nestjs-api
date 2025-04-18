import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyRegisterCodeDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsNumber()
  @IsNotEmpty()
  readonly code: number;
}
