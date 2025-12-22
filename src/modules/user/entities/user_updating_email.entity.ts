export class UserUpdatingEmailEntity {
  email: string;
  verificationCode: number;

  constructor(parameters: UserUpdatingEmailEntity) {
    Object.assign(this, parameters);
  }
}
