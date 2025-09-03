import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSocialNetworkDto {
  @IsNotEmpty()
  @IsString()
  readonly url: string;
}
