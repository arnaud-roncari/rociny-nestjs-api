import { ViewsHistoryEntity } from './views_history.entity';

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

  viewsHistory: ViewsHistoryEntity[];

  updatedAt: Date | null;

  constructor(parameters: {
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
    viewsHistory: ViewsHistoryEntity[];
    updatedAt: Date | null;
  }) {
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
      updatedAt: json.updated_at ? new Date(json.updated_at) : null,
      viewsHistory: ViewsHistoryEntity.fromJsons(json.views_history ?? []),
    });
  }

  static fromJsons(jsons: any[]): InstagramAccountEntity[] {
    if (!jsons) return [];

    return jsons
      .map((json) => InstagramAccountEntity.fromJson(json))
      .filter((e): e is InstagramAccountEntity => e !== null);
  }

  toJson(): any {
    return {
      id: this.id,
      user_id: this.userId,
      instagram_id: this.instagramId,
      name: this.name,
      username: this.username,
      profile_picture_url: this.profilePictureUrl,
      followers_count: this.followersCount,

      engagement_rate: this.engagementRate,
      reach: this.reach,
      views: this.views,
      total_interactions: this.totalInteractions,
      profile_view_rate: this.profileViewRate,
      profile_views: this.profileViews,
      website_clicks: this.websiteClicks,
      link_clicks: this.linkClicks,

      interaction_percentage_posts: this.interactionPercentagePosts,
      interaction_percentage_reels: this.interactionPercentageReels,
      post_percentage: this.postPercentage,
      reel_percentage: this.reelPercentage,

      last_media_url: this.lastMediaUrl,

      gender_male_percentage: this.genderMalePercentage,
      gender_female_percentage: this.genderFemalePercentage,
      top_cities: this.topCities,
      top_age_ranges: this.topAgeRanges,

      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
      views_history: ViewsHistoryEntity.toJsons(this.viewsHistory),
    };
  }
}
