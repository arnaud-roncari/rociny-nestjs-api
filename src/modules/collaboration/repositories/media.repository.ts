import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { InstagramMediaEntity } from '../entities/instagram_media.entity';

@Injectable()
export class InstagramMediaRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  async save(media: InstagramMediaEntity): Promise<void> {
  const query = `
    INSERT INTO api.instagram_media (
      media_id, instagram_account_id, media_type, timestamp, reach, likes, comments,
      shares, saves, views, interactions, profile_visits, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13
    )
  `;

  const values = [
    media.media_id,
    media.instagram_account_id,
    media.media_type,
    media.timestamp,
    media.reach,
    media.likes,
    media.comments,
    media.shares,
    media.saves,
    media.views,
    media.interactions,
    media.profile_visits,
    media.created_at,
  ];

  await this.postgresqlService.query(query, values);
}

  async saveFromGraphData(instagramId: string, media: any): Promise<void> {
    const metrics: Record<string, number> = {};
    media.stats.forEach((stat: any) => {
      metrics[stat.name] = stat.values?.[0]?.value || 0;
    });

    const entity = new InstagramMediaEntity({
      id: 0,
      media_id: media.media_id,
      instagram_account_id: instagramId,
      media_type: media.media_type,
      timestamp: new Date(media.timestamp),
      reach: metrics.reach || 0,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      saves: metrics.saved || 0,
      views: metrics.views || 0,
      interactions: metrics.total_interactions || 0,
      profile_visits: metrics.profile_visits || 0,
      created_at: new Date(),
    });

    await this.save(entity);
  }
}
