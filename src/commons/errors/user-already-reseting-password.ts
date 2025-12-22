import { ConflictException } from '@nestjs/common';

export class UserAlreadyResetingPassword extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:user:already_resetting_password',
        message: 'User already resetting password',
      },
      {
        description: 'The user is already resetting password,',
      },
    );
  }
}
