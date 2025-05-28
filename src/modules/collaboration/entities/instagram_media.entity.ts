export class InstagramMediaEntity {
  id: number;
  media_id: string;
  instagram_account_id: string;
  media_type: string;
  timestamp: Date;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  interactions: number;
  profile_visits: number;
  created_at: Date;

  constructor(data: InstagramMediaEntity) {
    Object.assign(this, data);
  }

  static fromJson(json: any): InstagramMediaEntity {
    return new InstagramMediaEntity({
      id: json.id,
      media_id: json.media_id,
      instagram_account_id: json.instagram_account_id,
      media_type: json.media_type,
      timestamp: new Date(json.timestamp),
      reach: json.reach,
      likes: json.likes,
      comments: json.comments,
      shares: json.shares,
      saves: json.saves,
      views: json.views,
      interactions: json.interactions,
      profile_visits: json.profile_visits,
      created_at: new Date(json.created_at),
    });
  }

  static fromJsons(jsons: any[]): InstagramMediaEntity[] {
    if (!jsons) return [];
    return jsons.map(InstagramMediaEntity.fromJson);
  }
}
