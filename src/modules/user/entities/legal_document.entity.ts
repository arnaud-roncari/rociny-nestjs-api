import { LegalDocumentStatus } from 'src/commons/enums/legal_document_status';
import { LegalDocumentType } from 'src/commons/enums/legal_document_type';

export class LegalDocumentEntity {
  id: string;
  influencerId: string | null;
  companyId: string | null;
  status: LegalDocumentStatus;
  type: LegalDocumentType;
  document: string;
  createdAt: Date;

  constructor(parameters: Partial<LegalDocumentEntity>) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): LegalDocumentEntity | null {
    if (!json) {
      return null;
    }

    return new LegalDocumentEntity({
      id: json.id,
      influencerId: json.influencer_id,
      companyId: json.company_id,
      status: json.status,
      type: json.type,
      document: json.document,
      createdAt: new Date(json.created_at),
    });
  }

  static fromJsons(jsons: any[]): LegalDocumentEntity[] {
    if (!jsons) {
      return [];
    }

    const entities: LegalDocumentEntity[] = [];
    for (const json of jsons) {
      const entity = LegalDocumentEntity.fromJson(json);
      if (entity) {
        entities.push(entity);
      }
    }
    return entities;
  }
}
