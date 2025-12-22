import { ConflictException } from '@nestjs/common';

export class UserAlreadyUpdatingEmail extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:user:already_updating_email',
        message: 'User already updating email',
      },
      {
        description: 'The user is already updating email,',
      },
    );
  }
}
