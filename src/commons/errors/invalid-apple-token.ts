import { ConflictException } from '@nestjs/common';

export class InvalidAppleTokenException extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:user:invalid_apple_token',
        message: 'Token is invalid',
      },
      {
        description: 'Token is invalid',
      },
    );
  }
}
