export class UserForgettingPasswordEntity {
  email: string;
  verificationCode: Number;

  constructor(parameters: UserForgettingPasswordEntity) {
    Object.assign(this, parameters);
  }
}
