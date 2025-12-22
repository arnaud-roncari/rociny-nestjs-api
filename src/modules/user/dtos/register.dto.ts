import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AccountType } from 'src/commons/enums/account_type';

export class RegisterDto {
  @ApiProperty({
    example: 'user@rociny.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ example: 'yourpassword' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({ example: 'influencer' })
  @IsString()
  @IsNotEmpty()
  readonly account_type: AccountType;
}
