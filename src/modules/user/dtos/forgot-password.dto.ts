import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'example@example.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
