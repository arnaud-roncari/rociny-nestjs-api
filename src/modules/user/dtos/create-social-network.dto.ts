import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsEnum } from 'class-validator';
import { PlatformType } from 'src/commons/enums/platform_type';

export class CreateSocialNetworkDto {
  @IsEnum(PlatformType)
  @IsNotEmpty()
  readonly platform: PlatformType;

  @IsNotEmpty()
  @IsString()
  readonly url: PlatformType;
}
