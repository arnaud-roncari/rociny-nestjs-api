import { NotFoundException } from '@nestjs/common';

export class InstagramNotFoundException extends NotFoundException {
  constructor() {
    super(
      {
        id: 'security:instagram:not_found',
        message: 'Instagram not found',
      },
      {
        description: 'The instagram was not found',
      },
    );
  }
}
