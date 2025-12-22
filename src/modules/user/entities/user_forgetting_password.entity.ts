export class UserForgettingPasswordEntity {
  email: string;
  verificationCode: number;

  constructor(parameters: UserForgettingPasswordEntity) {
    Object.assign(this, parameters);
  }
}
