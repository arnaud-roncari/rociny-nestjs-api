import { ConflictException } from '@nestjs/common';

export class UserAlreadyCompleted extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:user:already_completed',
        message: 'User already completed',
      },
      {
        description: 'The user already completed',
      },
    );
  }
}
