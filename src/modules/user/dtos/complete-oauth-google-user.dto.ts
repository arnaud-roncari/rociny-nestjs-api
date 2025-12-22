import { IsNotEmpty, IsString } from 'class-validator';
import { AccountType } from 'src/commons/enums/account_type';

export class CompleteOAuthGoogleUserDto {
  @IsString()
  @IsNotEmpty()
  readonly provider_user_id: string;

  @IsString()
  @IsNotEmpty()
  readonly account_type: AccountType;
}
