import { ConflictException } from '@nestjs/common';

export class SocialNetworkExists extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:social_network:already_exist',
        message: 'Social networl already exist',
      },
      {
        description: 'The social network already exists',
      },
    );
  }
}
