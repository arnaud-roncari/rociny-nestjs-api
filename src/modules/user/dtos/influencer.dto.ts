import { InfluencerEntity } from '../entities/influencer.entity';
import { SocialNetworkEntity } from '../entities/social_network.entity';
import { SocialNetworkDto } from './social-network.dto';

export class InfluencerDto {
  readonly id: number;
  readonly user_id: number;
  readonly profile_picture: string | null;
  readonly portfolio: string[];
  readonly name: string | null;
  readonly department: string | null;
  readonly description: string | null;
  readonly themes: string[];
  readonly target_audience: string[];
  readonly created_at: Date;
  readonly vat_number: string | null;
  readonly social_networks: SocialNetworkDto[];

  constructor(parameters: InfluencerDto) {
    Object.assign(this, parameters);
  }

  static fromEntity(
    influencer: InfluencerEntity,
    socialNetworks: SocialNetworkEntity[],
  ): InfluencerDto {
    return new InfluencerDto({
      id: influencer.id,
      user_id: influencer.userId,
      vat_number: influencer.vatNumber,
      profile_picture: influencer.profilePicture,
      portfolio: influencer.portfolio,
      name: influencer.name,
      department: influencer.department,
      description: influencer.description,
      themes: influencer.themes,
      target_audience: influencer.targetAudience,
      created_at: influencer.createdAt,
      social_networks: SocialNetworkDto.fromEntities(socialNetworks),
    });
  }
}
