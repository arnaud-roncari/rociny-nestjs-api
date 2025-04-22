export class CompanyEntity {
  id: number;
  userId: number;
  createdAt: Date;

  constructor(parameters: CompanyEntity) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): CompanyEntity | null {
    if (!json) {
      return null;
    }

    return new CompanyEntity({
      id: json.id,
      userId: json.user_id,
      createdAt: json.created_at ? new Date(json.created_at) : new Date(),
    });
  }

  static fromJsons(jsons: any[]): CompanyEntity[] {
    if (!jsons) {
      return [];
    }

    const entities: CompanyEntity[] = [];
    for (const json of jsons) {
      const entitie = CompanyEntity.fromJson(json);
      if (entitie) {
        entities.push(entitie);
      }
    }
    return entities;
  }
}
