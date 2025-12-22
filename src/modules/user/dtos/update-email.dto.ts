import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly new_email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
