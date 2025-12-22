import { UnauthorizedException } from '@nestjs/common';

export class InvalidCodeException extends UnauthorizedException {
  constructor() {
    super(
      {
        id: 'security:code:not_matching',
        message: 'Wrong code',
      },
      {
        description: 'The code does not match',
      },
    );
  }
}
