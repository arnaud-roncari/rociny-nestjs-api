import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyRegisterCodeDto {
  @ApiProperty({ example: 'example@example.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ example: '12345' })
  @IsNumber()
  @IsNotEmpty()
  readonly code: number;
}
