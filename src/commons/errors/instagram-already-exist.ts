import { ConflictException } from '@nestjs/common';

export class InstagramAlreadyExists extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:instagram:already_exist',
        message: 'Instagram already exist',
      },
      {
        description: 'The instagram already exists',
      },
    );
  }
}
