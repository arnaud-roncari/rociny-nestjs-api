import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { InstagramRepository } from '../repositories/instagram.repository';
import * as dayjs from 'dayjs';
import { InstagramDemographicsRepository } from '../repositories/demographics.repository';
import { InstagramInsightHistoryRepository } from '../repositories/insightHistory.repository';
import { InstagramMediaRepository } from '../repositories/media.repository';
import { InstagramInsightHistoryEntity } from '../entities/instagram-insight-history.entity';
import { InstagramDemographicsEntity } from '../entities/instagram-demographic.entity';
import { InstagramMediaEntity } from '../entities/instagram_media.entity';

interface InsightData {
  name: string;
  period: string;
  total_value?: { value: number };
}

@Injectable()
export class InstagramService {
  constructor(
    private readonly httpService: HttpService,
    private readonly instagramRepo: InstagramRepository,
    private readonly insightRepo: InstagramInsightHistoryRepository,
    private readonly demoRepo: InstagramDemographicsRepository,
    private readonly mediaRepo: InstagramMediaRepository,
  ) {}

  async syncInstagramData(instagramId: string): Promise<string> {
    const account = await this.instagramRepo.findByInstagramId(instagramId);
    if (!account || !account.page_access_token) {
      throw new Error('Compte ou token manquant');
    }

    const token = account.page_access_token;
    const today = dayjs();
    const since = today.subtract(30, 'days').format('YYYY-MM-DD');
    const until = today.format('YYYY-MM-DD');

    // 1. INSIGHTS JOURNALIERS
    const insightsUrl = `https://graph.facebook.com/v19.0/${instagramId}/insights?metric=reach,saves,likes,comments,shares,total_interactions,views,profile_views&metric_type=total_value&period=day&since=${since}&until=${until}&access_token=${token}`;
    const insightsResponse = await firstValueFrom(this.httpService.get(insightsUrl));
    const insights = insightsResponse.data.data;

    console.log('[Graph] insights:', JSON.stringify(insights, null, 2));

    const extractMetricValue = (metricName: string) => {
      const metric = insights.find(m => m.name === metricName);
      return metric?.total_value?.value || 0;
    };

    await this.instagramRepo.updateFieldsByInstagramId(instagramId, {
      reach: extractMetricValue('reach'),
      profile_views: extractMetricValue('profile_views'),
      insights_last_updated: new Date(),
    });

    // === Enregistrer l'historique des insights jour par jour ===
    const metrics: string[] = [
  'reach',
  'impressions',
  'profile_views',
  'website_clicks',
  'likes',
  'comments',
  'shares',
  'saves',
  'total_interactions',
  'views',
];

const dailyStats: Partial<InstagramInsightHistoryEntity> = {
  instagram_account_id: instagramId,
  created_at: new Date(),
};

const insightDate = insights[0]?.total_value?.end_time 
  ? new Date(insights[0].total_value.end_time)
  : new Date();
dailyStats.date = insightDate;

for (const item of insights as InsightData[]) {
  if (item.period !== 'day') continue;
  const value = item.total_value?.value ?? 0;

  if (metrics.includes(item.name)) {
    (dailyStats as any)[item.name] = value;
  }
}

if (Object.keys(dailyStats).length > 3) {
  await this.insightRepo.save(dailyStats as InstagramInsightHistoryEntity);
  console.log('[INFO] Daily insights saved:', dailyStats);
}

    // 2. DÉMOGRAPHIES
    const demographicTypes: ('city' | 'age' | 'gender')[] = ['city', 'age', 'gender'];
    const demographicsResponses = await Promise.all(
      demographicTypes.map(type =>
        firstValueFrom(this.httpService.get(
          `https://graph.facebook.com/v19.0/${instagramId}/insights?metric=follower_demographics&breakdown=${type}&metric_type=total_value&period=lifetime&access_token=${token}`
        ))
      )
    );

    const demographicsEntities: InstagramDemographicsEntity[] = [];

    demographicsResponses.forEach((resp, idx) => {
      const type = demographicTypes[idx];
      const results = resp.data?.data?.[0]?.total_value?.breakdowns?.[0]?.results || [];

      for (const item of results) {
        const label = item.dimension_values?.[0];
        const value = item.value;

        if (label && typeof value === 'number') {
          demographicsEntities.push(new InstagramDemographicsEntity({
            instagram_account_id: instagramId,
            type,
            label,
            value,
            created_at: new Date(),
          }));
        }
      }
    });

    console.log('[INFO] Saving demographics:', demographicsEntities);
    await this.demoRepo.bulkSave(demographicsEntities);

    // 3. MÉDIAS
    const mediaUrl = `https://graph.facebook.com/v19.0/${instagramId}/media?fields=id,media_type,timestamp&access_token=${token}`;
    const mediaList = (await firstValueFrom(this.httpService.get(mediaUrl))).data.data || [];

    console.log('[Graph] media list:', mediaList);

    for (const media of mediaList) {
      if (!['IMAGE', 'CAROUSEL_ALBUM'].includes(media.media_type)) continue;

      const mediaInsightsUrl = `https://graph.facebook.com/v19.0/${media.id}/insights?metric=reach,saved,likes,comments,shares,total_interactions,views,profile_visits&metric_type=total_value&access_token=${token}`;
      const insightsResult = (await firstValueFrom(this.httpService.get(mediaInsightsUrl))).data.data;

      const getMetric = (name: string) => {
        const metric = insightsResult.find((m: any) => m.name === name);
        return Array.isArray(metric?.values) ? metric.values[0]?.value || 0 : 0;
      };

      const entity = new InstagramMediaEntity({
        id: 0,
        media_id: media.id,
        instagram_account_id: instagramId,
        media_type: media.media_type,
        timestamp: new Date(media.timestamp),
        reach: getMetric('reach'),
        likes: getMetric('likes'),
        comments: getMetric('comments'),
        shares: getMetric('shares'),
        saves: getMetric('saved'),
        views: getMetric('views'),
        interactions: getMetric('total_interactions'),
        profile_visits: getMetric('profile_visits'),
        created_at: new Date(),
      });

      console.log('[INFO] Saving media data:', entity);
      await this.mediaRepo.save(entity);
    }

    return 'Données synchronisées avec succès.';
  }
} 
