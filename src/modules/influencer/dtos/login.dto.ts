import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'influencer@rociny.com',
    description: 'User email',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ example: 'yourpassword', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
