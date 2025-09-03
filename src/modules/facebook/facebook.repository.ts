import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../postgresql/postgresql.service';
import axios from 'axios';
import { FetchedInstagramAccountEntity } from './entities/fetched_instagram_account.entity';
import { InstagramAccountEntity } from './entities/instagram_account.entity';
import { InsightsEntity } from './entities/insight.entity';
import { GenderInsightEntity } from './entities/gender_insight.entity';
import { CityInsightEntity } from './entities/city_insight.entity';
import { AgeInsightEntity } from './entities/age_insight.entity';
import { MediaInsightEntity } from './entities/media_insight.entity';
import { InstagramProfileEntity } from './entities/instagram_profile.entity';
import { ViewsHistoryEntity } from './entities/views_history.entity';

@Injectable()
export class FacebookRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  private _getThirtyDaysAgo(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  private _getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Exchange a Facebook OAuth authorization code for a short-lived access token.
   * @param code - The authorization code received from Facebook after user login.
   * @returns The short-lived access token.
   */
  async exchangeCodeForShortLivedToken(code: string): Promise<string> {
    const url = 'https://graph.facebook.com/v19.0/oauth/access_token';

    const response = await axios.get(url, {
      params: {
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: `${process.env.ENDPOINT}/user/auth/login-with-facebook`,
        code,
      },
    });

    const accessToken = response.data.access_token;
    return accessToken;
  }

  /**
   * Exchange a short-lived Facebook access token for a long-lived one.
   * @param shortToken - The short-lived token to exchange.
   * @returns The long-lived access token.
   */
  async exchangeShortForLongLivedToken(shortToken: string): Promise<string> {
    const url = 'https://graph.facebook.com/v19.0/oauth/access_token';

    const response = await axios.get(url, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        fb_exchange_token: shortToken,
      },
    });

    const accessToken = response.data.access_token;
    return accessToken;
  }

  /**
   * Retrieve the Facebook user ID associated with a given access token.
   * @param accessToken - The Facebook access token.
   * @returns The user's Facebook ID.
   */
  async getFacebookId(accessToken: string): Promise<string> {
    const userInfoUrl = 'https://graph.facebook.com/me';

    const response = await axios.get(userInfoUrl, {
      params: {
        access_token: accessToken,
        fields: 'id',
      },
    });

    return response.data.id;
  }

  /**
   * Retrieve all Instagram Business Accounts linked to the user's Facebook pages.
   * @param accessToken - The Facebook access token of the user.
   * @returns A list of InstagramAccountEntity objects.
   */
  async getInstagramAccounts(
    accessToken: string,
  ): Promise<FetchedInstagramAccountEntity[]> {
    // Fetch all Facebook pages linked to the user
    const pagesRes = await axios.get('https://graph.facebook.com/me/accounts', {
      params: {
        access_token: accessToken,
      },
    });
    const pages = pagesRes.data.data || [];

    const instagramAccounts: FetchedInstagramAccountEntity[] = [];

    for (const page of pages) {
      const pageId = page.id;

      try {
        // Fetch the Instagram Business Account linked to the Facebook page
        const igRes = await axios.get(`https://graph.facebook.com/${pageId}`, {
          params: {
            access_token: accessToken,
            fields:
              'instagram_business_account{name,username,profile_picture_url,followers_count}',
          },
        });

        const igAccount = igRes.data.instagram_business_account;

        if (igAccount) {
          instagramAccounts.push(
            FetchedInstagramAccountEntity.fromJson(igAccount),
          );
        }
      } catch (_) {
        // If the page does not have an Instagram Business Account, we catch the error and continue
        void _;
      }
    }

    return instagramAccounts;
  }

  /**
   * Check if the user has a valid Facebook OAuth session.
   * @param userId - The user's id.
   * @returns True if the session exists and is not expired, false otherwise.
   */
  async hasFacebookSession(userId: number): Promise<boolean> {
    const query = `
      SELECT access_token, token_expiration
      FROM api.oauth_users
      WHERE user_id = $1 AND provider = 'facebook'
      LIMIT 1
    `;
    const result = await this.postgresqlService.query(query, [userId]);

    if (result.length === 0) return false;

    const { access_token, token_expiration } = result[0];
    if (!access_token || !token_expiration) return false;

    return new Date(token_expiration) > new Date();
  }

  /**
   * Check if the user has a linked Instagram account.
   * @param userId - The user's id.
   * @returns True if an Instagram account exists for the user, false otherwise.
   */
  async hasInstagramAccount(userId: number): Promise<boolean> {
    const query = `
    SELECT 1
    FROM api.instagram_accounts
    WHERE user_id = $1
    LIMIT 1
  `;
    const result = await this.postgresqlService.query(query, [userId]);
    return result.length > 0;
  }

  /**
   * Get the Instagram account linked to the user.
   * @param userId - The user's id.
   * @returns The Instagram account entity or null if not found.
   */
  async getInstagramAccount(
    userId: number,
  ): Promise<InstagramAccountEntity | null> {
    const query = `
    SELECT *
    FROM api.instagram_accounts
    WHERE user_id = $1
    LIMIT 1
  `;
    const result = await this.postgresqlService.query(query, [userId]);
    return result.length > 0
      ? InstagramAccountEntity.fromJson(result[0])
      : null;
  }

  /**
   * Create an Instagram account record for a user.
   * @param userId - The user's id.
   * @param instagramId - The Instagram account ID.
   * @param name - The Instagram account name.
   * @param username - The Instagram username.
   * @param followersCount - Number of followers.
   * @param profilePictureUrl - URL of the profile picture.
   * @returns The newly created Instagram account entity.
   */
  async createInstagramAccount(
    userId: number,
    instagramId: string,
    name: string,
    username: string,
    followersCount: number | null,
    profilePictureUrl: string | null,
  ): Promise<InstagramAccountEntity> {
    const query = `
    INSERT INTO api.instagram_accounts (
      user_id,
      instagram_id,
      name,
      username,
      followers_count,
      profile_picture_url
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

    const values = [
      userId,
      instagramId,
      name,
      username,
      followersCount,
      profilePictureUrl,
    ];

    const result = await this.postgresqlService.query(query, values);
    return InstagramAccountEntity.fromJson(result[0]);
  }

  /**
   * Delete an Instagram account for a specific user.
   * @param userId - The user's id.
   */
  async deleteInstagramAccount(userId: number): Promise<void> {
    const query = `
    DELETE FROM api.instagram_accounts
    WHERE user_id = $1
  `;

    await this.postgresqlService.query(query, [userId]);
  }

  /// age city

  /**
   * Fetches Instagram insights for the last 30 days.
   *
   * Includes:
   * - views
   * - reach
   * - profile views
   * - website clicks
   * - profile link taps
   * - total interactions
   *
   * @param instagramId - Instagram user ID
   * @param token - Access token
   * @returns InsightsEntity with aggregated values
   */
  async getInsights(
    instagramId: string,
    token: string,
  ): Promise<InsightsEntity> {
    const url = `https://graph.facebook.com/v19.0/${instagramId}/insights`;
    const response = await axios.get(url, {
      params: {
        metric:
          'views,reach,profile_views,website_clicks,total_interactions,profile_links_taps',
        period: 'day',
        metric_type: 'total_value',
        access_token: token,
        since: this._getThirtyDaysAgo(),
        until: this._getToday(),
      },
    });
    const entity = InsightsEntity.fromResponse(response);
    return entity;
  }

  async getGenderInsight(
    instagramId: string,
    token: string,
  ): Promise<GenderInsightEntity> {
    const url = `https://graph.facebook.com/v19.0/${instagramId}/insights`;

    const response = await axios.get(url, {
      params: {
        metric: 'follower_demographics',
        breakdown: 'gender',
        period: 'lifetime',
        metric_type: 'total_value',
        access_token: token,
      },
    });
    const entity = GenderInsightEntity.fromBreakdowns(
      response.data.data[0].total_value.breakdowns[0].results,
    );
    return entity;
  }

  async getCityInsight(
    instagramId: string,
    token: string,
  ): Promise<CityInsightEntity> {
    const url = `https://graph.facebook.com/v19.0/${instagramId}/insights`;

    const response = await axios.get(url, {
      params: {
        metric: 'follower_demographics',
        breakdown: 'city',
        period: 'lifetime',
        metric_type: 'total_value',
        access_token: token,
      },
    });

    const entity = CityInsightEntity.fromBreakdowns(
      response.data.data[0].total_value.breakdowns[0].results,
    );
    return entity;
  }

  async getAgeInsight(
    instagramId: string,
    token: string,
  ): Promise<AgeInsightEntity> {
    const url = `https://graph.facebook.com/v19.0/${instagramId}/insights`;

    const response = await axios.get(url, {
      params: {
        metric: 'follower_demographics',
        breakdown: 'age',
        period: 'lifetime',
        metric_type: 'total_value',
        access_token: token,
      },
    });

    const entity = AgeInsightEntity.fromBreakdowns(
      response.data.data[0].total_value.breakdowns[0].results,
    );
    return entity;
  }

  async getMediaInsight(
    instagramId: string,
    token: string,
  ): Promise<MediaInsightEntity> {
    const url = `https://graph.facebook.com/v20.0/${instagramId}/media`;

    const response = await axios.get(url, {
      params: {
        fields: 'id,media_type,media_url,like_count,comments_count',
        limit: 20,
        access_token: token,
      },
    });

    const mediaList = response.data?.data ?? [];
    return MediaInsightEntity.fromMediaList(mediaList);
  }

  async updateInstagramAccount(stats: {
    userId: number;
    reach: number;
    views: number;
    profileViews: number;
    profileViewRate: number;
    websiteClicks: number;
    linkClicks: number;
    engagementRate: number;
    totalInteractions: number;
    interactionPercentagePosts: number;
    interactionPercentageReels: number;
    postPercentage: number;
    reelPercentage: number;
    genderMalePercentage: number;
    genderFemalePercentage: number;
    topCities: string[];
    topAgeRanges: string[];
    lastMediaUrl: string;
    followersCount: number;
    profilePictureUrl: string;
    viewsHistory: ViewsHistoryEntity[];
  }): Promise<void> {
    const query = `
    UPDATE api.instagram_accounts
    SET
      reach = $1,
      views = $2,
      profile_views = $3,
      profile_view_rate = $4,
      website_clicks = $5,
      link_clicks = $6,
      engagement_rate = $7,
      total_interactions = $8,
      interaction_percentage_posts = $9,
      interaction_percentage_reels = $10,
      post_percentage = $11,
      reel_percentage = $12,
      gender_male_percentage = $13,
      gender_female_percentage = $14,
      top_cities = $15,
      top_age_ranges = $16,
      last_media_url = $17,
      followers_count = $18,
      profile_picture_url = $19,
      views_history = $20, 
      updated_at = NOW()
    WHERE user_id = $21
  `;

    await this.postgresqlService.query(query, [
      stats.reach,
      stats.views,
      stats.profileViews,
      stats.profileViewRate,
      stats.websiteClicks,
      stats.linkClicks,
      stats.engagementRate,
      stats.totalInteractions,
      stats.interactionPercentagePosts,
      stats.interactionPercentageReels,
      stats.postPercentage,
      stats.reelPercentage,
      stats.genderMalePercentage,
      stats.genderFemalePercentage,
      stats.topCities,
      stats.topAgeRanges,
      stats.lastMediaUrl,
      stats.followersCount,
      stats.profilePictureUrl,
      JSON.stringify(ViewsHistoryEntity.toJsons(stats.viewsHistory)),
      stats.userId,
    ]);
  }

  async getInstagramProfile(
    instagramId: string,
    token: string,
  ): Promise<InstagramProfileEntity> {
    const url = `https://graph.facebook.com/v19.0/${instagramId}`;

    const response = await axios.get(url, {
      params: {
        fields: 'username,profile_picture_url,followers_count',
        access_token: token,
      },
    });

    return InstagramProfileEntity.fromResponse(response.data);
  }

  async getViewsHistory(
    instagramId: string,
    accessToken: string,
  ): Promise<ViewsHistoryEntity[]> {
    const mediaUrl = `https://graph.facebook.com/v20.0/${instagramId}/media`;

    const mediaRes = await axios.get(mediaUrl, {
      params: {
        fields: 'id,timestamp,media_type,media_product_type',
        limit: 20,
        access_token: accessToken,
      },
    });

    const mediaList = mediaRes.data?.data ?? [];
    const viewsHistory: ViewsHistoryEntity[] = [];

    for (const media of mediaList) {
      const { id, timestamp } = media;
      const insightsRes = await axios.get(
        `https://graph.facebook.com/v20.0/${id}/insights`,
        {
          params: {
            metric: 'views',
            access_token: accessToken,
          },
        },
      );

      const insights = insightsRes.data?.data ?? [];
      const viewMetric = insights.find((m) => m.name === 'views');
      const views = viewMetric?.values?.[0]?.value ?? 0;
      if (views === 0) {
        continue;
      }
      const date = new Date(timestamp);

      viewsHistory.push(new ViewsHistoryEntity(date, views));
    }

    return viewsHistory;
  }
}
