import { UnauthorizedException } from '@nestjs/common';

export class InvalidPasswordException extends UnauthorizedException {
  constructor() {
    super(
      {
        id: 'security:password:not_matching',
        message: 'Wrong password',
      },
      {
        description: 'The password does not match',
      },
    );
  }
}
