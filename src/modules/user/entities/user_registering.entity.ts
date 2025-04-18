import { AccountType } from 'src/commons/enums/account_type';

export class UserRegisteringEntity {
  email: string;
  passwordHash: string;
  accountType: AccountType;
  verificationCode: Number;

  constructor(parameters: UserRegisteringEntity) {
    Object.assign(this, parameters);
  }
}
