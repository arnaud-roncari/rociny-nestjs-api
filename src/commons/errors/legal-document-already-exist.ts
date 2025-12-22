import { ConflictException } from '@nestjs/common';

export class LegalDocumentAlreadyExists extends ConflictException {
  constructor() {
    super(
      {
        id: 'security:legal_document:already_exist',
        message: 'Legal document already exist',
      },
      {
        description: 'The legal document already exists',
      },
    );
  }
}
