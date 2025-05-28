export class InstagramInsightHistoryEntity {
  id?: number;
  instagram_account_id: string;
  date: Date;
  reach: number;
  impressions: number;
  profile_views: number;
  website_clicks: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  total_interactions: number;
  views: number;
  created_at: Date;

  constructor(data: InstagramInsightHistoryEntity) {
    Object.assign(this, data);
  }

  static fromJson(json: any): InstagramInsightHistoryEntity {
    return new InstagramInsightHistoryEntity({
      id: json.id,
      instagram_account_id: json.instagram_account_id,
      date: new Date(json.date),
      reach: json.reach,
      impressions: json.impressions,
      profile_views: json.profile_views,
      website_clicks: json.website_clicks,
      likes: json.likes,
      comments: json.comments,
      shares: json.shares,
      saves: json.saves,
      total_interactions: json.total_interactions,
      views: json.views,
      created_at: new Date(json.created_at),
    });
  }
}