import { NotFoundException } from '@nestjs/common';

export class FileNotFoundException extends NotFoundException {
  constructor() {
    super(
      {
        id: 'security:file:not_found',
        message: 'File not found',
      },
      {
        description: 'The file was not found',
      },
    );
  }
}
