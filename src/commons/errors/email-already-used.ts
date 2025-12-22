import { ConflictException } from '@nestjs/common';

export class EmailAlreadyUsed extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:email:already_used',
        message: 'Email already used',
      },
      {
        description: 'The email is already used',
      },
    );
  }
}
