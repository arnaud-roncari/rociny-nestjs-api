import { InstagramAccountEntity } from '../entities/instagram_account.entity';

export class InstagramAccountDto {
  readonly id: number;
  readonly user_id: number;
  readonly instagram_id: string;
  readonly name: string;
  readonly username: string;
  readonly profile_picture_url?: string | null;
  readonly followers_count?: number | null;
  readonly reach?: number | null;
  readonly views?: number | null;
  readonly profile_views?: number | null;
  readonly profile_view_rate?: number | null;
  readonly website_clicks?: number | null;
  readonly link_clicks?: number | null;
  readonly engagement_rate?: number | null;
  readonly total_interactions?: number | null;
  readonly interaction_percentage_posts?: number | null;
  readonly interaction_percentage_reels?: number | null;
  readonly post_percentage?: number | null;
  readonly reel_percentage?: number | null;
  readonly gender_male_percentage?: number | null;
  readonly gender_female_percentage?: number | null;
  readonly top_cities?: string[] | null;
  readonly top_age_ranges?: string[] | null;
  readonly last_media_url?: string | null;

  constructor(parameters: InstagramAccountDto) {
    Object.assign(this, parameters);
  }

  static fromEntity(entity: InstagramAccountEntity): InstagramAccountDto {
    return new InstagramAccountDto({
      id: entity.id,
      user_id: entity.userId,
      instagram_id: entity.instagramId,
      name: entity.name,
      username: entity.username,

      profile_picture_url: entity.profilePictureUrl ?? null,
      followers_count: entity.followersCount ?? null,

      reach: entity.reach ?? null,
      views: entity.views ?? null,
      profile_views: entity.profileViews ?? null,
      profile_view_rate: entity.profileViewRate ?? null,
      website_clicks: entity.websiteClicks ?? null,
      link_clicks: entity.linkClicks ?? null,

      engagement_rate: entity.engagementRate ?? null,
      total_interactions: entity.totalInteractions ?? null,
      interaction_percentage_posts: entity.interactionPercentagePosts ?? null,
      interaction_percentage_reels: entity.interactionPercentageReels ?? null,

      post_percentage: entity.postPercentage ?? null,
      reel_percentage: entity.reelPercentage ?? null,

      gender_male_percentage: entity.genderMalePercentage ?? null,
      gender_female_percentage: entity.genderFemalePercentage ?? null,
      top_cities: entity.topCities ?? null,
      top_age_ranges: entity.topAgeRanges ?? null,

      last_media_url: entity.lastMediaUrl ?? null,
    });
  }

  static fromEntities(
    entities: InstagramAccountEntity[],
  ): InstagramAccountDto[] {
    return entities.map((entity) => InstagramAccountDto.fromEntity(entity));
  }
}
