import { ConflictException } from '@nestjs/common';

export class UserAlreadyRegistering extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:user:already_registering',
        message: 'User already registering',
      },
      {
        description: 'The user is already registering',
      },
    );
  }
}
