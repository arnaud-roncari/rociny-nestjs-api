import { NotFoundException } from '@nestjs/common';

export class FileRequiredException extends NotFoundException {
  constructor() {
    super(
      {
        id: 'security:user:file_required',
        message: 'File required',
      },
      {
        description: 'A file is required',
      },
    );
  }
}
