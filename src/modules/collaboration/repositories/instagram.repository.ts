import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { InstagramAccountEntity } from '../entities/instagram-account.entity';

@Injectable()
export class InstagramRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  async findByInstagramId(instagram_id: string): Promise<InstagramAccountEntity | null> {
    const query = `
      SELECT *
      FROM api.instagram_accounts
      WHERE instagram_id = $1
      LIMIT 1
    `;
    const result = await this.postgresqlService.query(query, [instagram_id]);
    return result.length > 0 ? InstagramAccountEntity.fromJson(result[0]) : null;
  }

  async findAll(): Promise<InstagramAccountEntity[]> {
    const query = `SELECT * FROM api.instagram_accounts`;
    const result = await this.postgresqlService.query(query);
    return result.map(row => InstagramAccountEntity.fromJson(row));
  }

  async create(account: Partial<InstagramAccountEntity>): Promise<InstagramAccountEntity> {
    const query = `
      INSERT INTO api.instagram_accounts (
        user_id, instagram_id, facebook_id, username, name, profile_picture_url, biography, website,
        followers_count, follows_count, media_count,
        average_engagement_rate, average_likes, average_comments,
        reach, impressions, profile_views, website_clicks, insights_last_updated,
        facebook_token, page_access_token,
        user_token_last_refresh, page_token_last_refresh, needs_reconnect
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17, $18, $19,
        $20, $21,
        $22, $23, $24
      )
      RETURNING *
    `;
    const values = [
      account.user_id,
      account.instagram_id,
      account.facebook_id,
      account.username,
      account.name,
      account.profile_picture_url,
      account.biography,
      account.website,
      account.followers_count,
      account.follows_count,
      account.media_count,
      account.average_engagement_rate,
      account.average_likes,
      account.average_comments,
      account.reach,
      account.impressions,
      account.profile_views,
      account.website_clicks,
      account.insights_last_updated,
      account.facebook_token,
      account.page_access_token,
      account.user_token_last_refresh ?? null,
      account.page_token_last_refresh ?? null,
      account.needs_reconnect ?? false,
    ];

    const result = await this.postgresqlService.query(query, values);
    return InstagramAccountEntity.fromJson(result[0]);
  }

  async updateByInstagramId(instagramId: string, updates: Partial<InstagramAccountEntity>): Promise<void> {
    const query = `
      UPDATE api.instagram_accounts
      SET
        username = $1,
        name = $2,
        profile_picture_url = $3,
        biography = $4,
        website = $5,
        followers_count = $6,
        follows_count = $7,
        media_count = $8,
        facebook_token = $9,
        page_access_token = $10,
        user_token_last_refresh = COALESCE($11, user_token_last_refresh),
        page_token_last_refresh = COALESCE($12, page_token_last_refresh),
        needs_reconnect = COALESCE($13, needs_reconnect),
        updated_at = NOW()
      WHERE instagram_id = $14;
    `;

    const values = [
      updates.username,
      updates.name,
      updates.profile_picture_url,
      updates.biography,
      updates.website,
      updates.followers_count,
      updates.follows_count,
      updates.media_count,
      updates.facebook_token,
      updates.page_access_token,
      updates.user_token_last_refresh ?? null,
      updates.page_token_last_refresh ?? null,
      updates.needs_reconnect ?? null,
      instagramId,
    ];

    await this.postgresqlService.query(query, values);
  }

  /**
   * Met à jour le flag needs_reconnect selon la logique que tu as définie,
   * en fonction des dates user_token_last_refresh et page_token_last_refresh.
   */
  async updateReconnectStatus(instagramId: string, needsReconnect: boolean): Promise<void> {
    const query = `
      UPDATE api.instagram_accounts
      SET needs_reconnect = $1, updated_at = NOW()
      WHERE instagram_id = $2
    `;
    await this.postgresqlService.query(query, [needsReconnect, instagramId]);
  }

  async updateFieldsByInstagramId(instagramId: string, fields: Record<string, any>): Promise<void> {
    const updates = Object.entries(fields)
      .map(([key, _], index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [instagramId, ...Object.values(fields)];
    const query = `UPDATE api.instagram_accounts SET ${updates} WHERE instagram_id = $1`;

    await this.postgresqlService.query(query, values);
  }

  /**
   * Met à jour les dates de refresh des tokens pour un compte donné.
   */
  async updateTokenRefreshDates(instagramId: string, userTokenDate?: Date, pageTokenDate?: Date): Promise<void> {
    const query = `
      UPDATE api.instagram_accounts
      SET
        user_token_last_refresh = COALESCE($1, user_token_last_refresh),
        page_token_last_refresh = COALESCE($2, page_token_last_refresh),
        updated_at = NOW()
      WHERE instagram_id = $3
    `;
    await this.postgresqlService.query(query, [userTokenDate ?? null, pageTokenDate ?? null, instagramId]);
  }

  async updateOrCreateByInstagramId(account: InstagramAccountEntity): Promise<void> {
  const existing = await this.findByInstagramId(account.instagram_id);

  if (existing) {
    const query = `
      UPDATE api.instagram_accounts SET
        username = $1,
        name = $2,
        profile_picture_url = $3,
        biography = $4,
        website = $5,
        followers_count = $6,
        follows_count = $7,
        media_count = $8,
        average_engagement_rate = $9,
        average_likes = $10,
        average_comments = $11,
        reach = $12,
        impressions = $13,
        profile_views = $14,
        website_clicks = $15,
        insights_last_updated = $16,
        facebook_token = $17,
        page_access_token = $18,
        user_token_last_refresh = $19,
        page_token_last_refresh = $20,
        needs_reconnect = $21,
        updated_at = NOW()
      WHERE instagram_id = $22
    `;

    await this.postgresqlService.query(query, [
      account.username,
      account.name,
      account.profile_picture_url,
      account.biography,
      account.website,
      account.followers_count,
      account.follows_count,
      account.media_count,
      account.average_engagement_rate,
      account.average_likes,
      account.average_comments,
      account.reach,
      account.impressions,
      account.profile_views,
      account.website_clicks,
      account.insights_last_updated,
      account.facebook_token,
      account.page_access_token,
      account.user_token_last_refresh,
      account.page_token_last_refresh,
      account.needs_reconnect,
      account.instagram_id,
    ]);
  } else {
    const query = `
      INSERT INTO api.instagram_accounts (
        user_id, instagram_id, facebook_id, username, name,
        profile_picture_url, biography, website,
        followers_count, follows_count, media_count,
        average_engagement_rate, average_likes, average_comments,
        reach, impressions, profile_views, website_clicks,
        insights_last_updated, facebook_token, page_access_token,
        user_token_last_refresh, page_token_last_refresh,
        needs_reconnect, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17, $18,
        $19, $20, $21,
        $22, $23,
        $24, NOW(), NOW()
      )
    `;

    await this.postgresqlService.query(query, [
      account.user_id,
      account.instagram_id,
      account.facebook_id,
      account.username,
      account.name,
      account.profile_picture_url,
      account.biography,
      account.website,
      account.followers_count,
      account.follows_count,
      account.media_count,
      account.average_engagement_rate,
      account.average_likes,
      account.average_comments,
      account.reach,
      account.impressions,
      account.profile_views,
      account.website_clicks,
      account.insights_last_updated,
      account.facebook_token,
      account.page_access_token,
      account.user_token_last_refresh,
      account.page_token_last_refresh,
      account.needs_reconnect,
    ]);
  }
}
}
