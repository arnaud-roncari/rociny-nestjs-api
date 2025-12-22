import { PlatformType } from 'src/commons/enums/platform_type';

export class SocialNetworkEntity {
  id: string;
  influencerId: string | null;
  companyId: string | null;
  platform: PlatformType;
  followers: number;
  url: string;
  createdAt: Date;

  constructor(parameters: SocialNetworkEntity) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): SocialNetworkEntity | null {
    if (!json) {
      return null;
    }

    return new SocialNetworkEntity({
      id: json.id,
      influencerId: json.influencer_id,
      companyId: json.company_id,
      platform: json.platform,
      followers: json.followers,
      url: json.url,
      createdAt: new Date(json.created_at),
    });
  }

  static fromJsons(jsons: any[]): SocialNetworkEntity[] {
    if (!jsons) {
      return [];
    }

    const entities: SocialNetworkEntity[] = [];
    for (const json of jsons) {
      const entity = SocialNetworkEntity.fromJson(json);
      if (entity) {
        entities.push(entity);
      }
    }
    return entities;
  }
}
