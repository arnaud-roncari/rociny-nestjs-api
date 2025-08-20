import { SocialNetworkEntity } from './social_network.entity';

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
  socialNetworks: SocialNetworkEntity[];
  vatNumber: string | null;
  createdAt: Date;

  collaborationAmount: number;
  averageStars: number;

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
      vatNumber: json.vat_number,
      profilePicture: json.profile_picture,
      portfolio: json.portfolio || [],
      name: json.name,
      stripeAccountId: json.stripe_account_id,
      department: json.department,
      description: json.description,
      themes: json.themes || [],
      targetAudience: json.target_audience || [],
      socialNetworks: SocialNetworkEntity.fromJsons(json.social_networks || []),
      createdAt: json.created_at ? new Date(json.created_at) : new Date(),

      collaborationAmount: json.collaboration_amount || 0,
      averageStars: parseFloat(json.average_stars) || 0,
    });
  }

  static fromJsons(jsons: any[]): InfluencerEntity[] {
    if (!jsons) {
      return [];
    }

    const entities: InfluencerEntity[] = [];
    for (const json of jsons) {
      const entity = InfluencerEntity.fromJson(json);
      if (entity) {
        entities.push(entity);
      }
    }
    return entities;
  }
}
