import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super(
      {
        id: 'security:user:not_found',
        message: 'User not found',
      },
      {
        description: 'The user was not found',
      },
    );
  }
}
