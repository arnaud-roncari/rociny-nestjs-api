import { ConflictException } from '@nestjs/common';

export class InvalidGoogleTokenException extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:user:invalid_google_token',
        message: 'Token is invalid',
      },
      {
        description: 'Token is invalid',
      },
    );
  }
}
