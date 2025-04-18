import { ConflictException } from '@nestjs/common';

export class UserAlreadyExists extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:user:already_exist',
        message: 'User already exist',
      },
      {
        description: 'The user already exists',
      },
    );
  }
}
