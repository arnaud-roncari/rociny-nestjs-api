export class InstagramAccountEntity {
  id: number;
  userId: number;
  instagramId: string;
  name: string;
  username: string;
  profilePictureUrl: string | null;
  followersCount: number | null;

  engagementRate: number | null;
  reach: number | null;
  views: number | null;
  totalInteractions: number | null;
  profileViewRate: number | null;
  profileViews: number | null;
  websiteClicks: number | null;
  linkClicks: number | null;

  interactionPercentagePosts: number | null;
  interactionPercentageReels: number | null;
  postPercentage: number | null;
  reelPercentage: number | null;

  lastMediaUrl: string | null;

  genderMalePercentage: number | null;
  genderFemalePercentage: number | null;
  topCities: string[];
  topAgeRanges: string[];

  updatedAt: Date | null;

  constructor(parameters: InstagramAccountEntity) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): InstagramAccountEntity | null {
    if (!json) return null;

    return new InstagramAccountEntity({
      id: json.id,
      userId: json.user_id,
      instagramId: json.instagram_id,
      name: json.name,
      username: json.username,
      profilePictureUrl: json.profile_picture_url || null,
      followersCount: json.followers_count ?? null,
      reach: json.reach ?? null,
      views: json.views ?? null,
      profileViewRate: json.profile_view_rate ?? null,
      profileViews: json.profile_views ?? null,
      websiteClicks: json.website_clicks ?? null,
      linkClicks: json.link_clicks ?? null,
      engagementRate: json.engagement_rate ?? null,
      totalInteractions: json.total_interactions ?? null,
      interactionPercentagePosts: json.interaction_percentage_posts ?? null,
      interactionPercentageReels: json.interaction_percentage_reels ?? null,
      postPercentage: json.post_percentage ?? null,
      reelPercentage: json.reel_percentage ?? null,
      genderMalePercentage: json.gender_male_percentage ?? null,
      genderFemalePercentage: json.gender_female_percentage ?? null,
      topCities: json.top_cities ?? [],
      topAgeRanges: json.top_age_ranges ?? [],
      lastMediaUrl: json.last_media_url ?? null,
      updatedAt: json.updated_at ?? null,
    });
  }

  static fromJsons(jsons: any[]): InstagramAccountEntity[] {
    if (!jsons) return [];

    return jsons
      .map((json) => InstagramAccountEntity.fromJson(json))
      .filter((e): e is InstagramAccountEntity => e !== null);
  }
}
