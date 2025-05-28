export class InstagramAccountEntity {
    id: number;
    user_id: string | null;
    instagram_id: string;
    facebook_id: string;
    username: string;
    name: string | null;
    profile_picture_url: string | null;
    biography: string | null;
    website: string | null;
    followers_count: number;
    follows_count: number;
    media_count: number;
    average_engagement_rate: number | null;
    average_likes: number | null;
    average_comments: number | null;
    reach: number | null;
    impressions: number | null;
    profile_views: number | null;
    website_clicks: number | null;
    insights_last_updated: Date | null;
    facebook_token: string | null;  
    page_access_token: string | null;
    user_token_last_refresh: Date;
    page_token_last_refresh: Date;
    needs_reconnect: Boolean;
    created_at: Date;
    updated_at: Date;

    constructor(parameters: InstagramAccountEntity) {
      Object.assign(this, parameters);
    }

    static fromJson(json: any): InstagramAccountEntity | null {
      if (!json) {
        return null;
      }
  
      return new InstagramAccountEntity({
        id: json.id,
        user_id: json.user_id,
        instagram_id: json.instagram_id,
        facebook_id: json.facebook_id,
        username: json.username,
        name: json.name,
        profile_picture_url: json.profile_picture_url,
        biography: json.biography,
        website: json.website,
        followers_count: json.followers_count,
        follows_count: json.follows_count,
        media_count: json.media_count,
        average_engagement_rate: json.average_engagement_rate,
        average_likes: json.average_likes,
        average_comments: json.average_comments,
        reach: json.reach,
        impressions: json.impressions,
        profile_views: json.profile_views,
        website_clicks: json.website_clicks,
        insights_last_updated: json.insights_last_updated ? new Date(json.insights_last_updated) : null,
        facebook_token: json.facebook_token,  
        page_access_token: json.page_access_token,
        user_token_last_refresh: json.user_token_last_refresh ? new Date(json.user_token_last_refresh) : new Date(),
        page_token_last_refresh: json.page_token_last_refresh ? new Date(json.page_token_last_refresh) : new Date(),
        needs_reconnect: json.needs_reconnect,
        created_at: json.created_at ? new Date(json.created_at) : new Date(),
        updated_at: json.updated_at ? new Date(json.updated_at) : new Date(),
      });
    }
    
    static fromJsons(jsons: any[]): InstagramAccountEntity[] {
      if (!jsons) {
        return [];
      }
      const entities: InstagramAccountEntity[] = [];
      for (const json of jsons) {
        const entitie = InstagramAccountEntity.fromJson(json);
        if (entitie) {
          entities.push(entitie);
        }
      }
      return entities;
    }
  }