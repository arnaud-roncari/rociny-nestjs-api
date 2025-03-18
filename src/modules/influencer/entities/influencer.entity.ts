export class InfluencerEntity {
  id: number;
  email: string;
  passwordHash: string;
  picturePath: string;
  createdAt: Date;

  constructor(parameters: InfluencerEntity) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): InfluencerEntity | null {
    if (!json) {
      return null;
    }

    return new InfluencerEntity({
      id: json.id,
      email: json.email,
      passwordHash: json.password_hash,
      picturePath: json.picture_path,
      createdAt: new Date(json.created_at),
    });
  }

  static fromJsons(jsons: any[]): InfluencerEntity[] {
    if (!jsons) {
      return [];
    }

    const entities: InfluencerEntity[] = [];
    for (const json of jsons) {
      const entitie = InfluencerEntity.fromJson(json);
      if (entitie) {
        entities.push(entitie);
      }
    }
    return entities;
  }
}
