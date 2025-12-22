import { AccountType } from '../enums/account_type';

export type JwtContent = {
  id: number;
  account_type: AccountType;
};
