import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { InstagramInsightHistoryEntity } from '../entities/instagram-insight-history.entity';

@Injectable()
export class InstagramInsightHistoryRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  async create(insight: InstagramInsightHistoryEntity): Promise<void> {
    const query = `
      INSERT INTO api.instagram_insights_history (
        instagram_account_id, date, reach, impressions, profile_views, website_clicks,
        likes, comments, shares, saves, total_interactions, views, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;
    const values = [
      insight.instagram_account_id,
      insight.date,
      insight.reach,
      insight.impressions,
      insight.profile_views,
      insight.website_clicks,
      insight.likes,
      insight.comments,
      insight.shares,
      insight.saves,
      insight.total_interactions,
      insight.views,
      insight.created_at,
    ];
    await this.postgresqlService.query(query, values);
  }

  async saveMediaStats(instagramId: string, media: any): Promise<void> {
    const metrics: Record<string, number> = {};
    media.stats.forEach((stat: any) => {
      metrics[stat.name] = stat.values?.[0]?.value || 0;
    });

    const entity = new InstagramInsightHistoryEntity({
      instagram_account_id: instagramId,
      date: new Date(media.timestamp),
      reach: metrics.reach || 0,
      impressions: metrics.impressions || 0,
      profile_views: metrics.profile_visits || 0,
      website_clicks: metrics.website_clicks || 0,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      saves: metrics.saved || 0,
      total_interactions: metrics.total_interactions || 0,
      views: metrics.views || 0,
      created_at: new Date(),
    });

    await this.create(entity);
  }
  async save(insight: InstagramInsightHistoryEntity): Promise<void> {
  const query = `
    INSERT INTO api.instagram_insights_history (
      instagram_account_id, date, reach, impressions, profile_views, website_clicks,
      likes, comments, shares, saves, total_interactions, views, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `;
  const values = [
    insight.instagram_account_id,
    insight.date,
    insight.reach,
    insight.impressions,
    insight.profile_views,
    insight.website_clicks,
    insight.likes,
    insight.comments,
    insight.shares,
    insight.saves,
    insight.total_interactions,
    insight.views,
    insight.created_at,
  ];
  await this.postgresqlService.query(query, values);
}
}
