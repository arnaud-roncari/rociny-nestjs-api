import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSocialNetworkDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  readonly url: string;
}
