export class InfluencerEntity {
  id: number;
  userId: number;
  profilePicture: string | null;
  portfolio: string[];
  name: string | null;
  department: string | null;
  description: string | null;
  stripeAccountId: string;
  themes: string[];
  targetAudience: string[];
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
      userId: json.user_id,
      profilePicture: json.profile_picture,
      portfolio: json.portfolio || [],
      name: json.name,
      stripeAccountId: json.stripe_account_id,
      department: json.department,
      description: json.description,
      themes: json.themes || [],
      targetAudience: json.target_audience || [],
      createdAt: json.created_at ? new Date(json.created_at) : new Date(),
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
