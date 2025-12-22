import { NotFoundException } from '@nestjs/common';

export class CollaborationNotFoundException extends NotFoundException {
  constructor() {
    super(
      {
        id: 'security:collaboration:not_found',
        message: 'Collaboration not found',
      },
      {
        description: 'The collaboration was not found',
      },
    );
  }
}
