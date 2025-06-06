import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../postgresql/postgresql.service';
import axios from 'axios';
import { FetchedInstagramAccountEntity } from './entities/fetched_instagram_account.entity';
import { InstagramAccountEntity } from './entities/instagram_account.entity';

@Injectable()
export class FacebookRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

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
  async hasFacebookSession(userId: string): Promise<boolean> {
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
  async hasInstagramAccount(userId: string): Promise<boolean> {
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
    userId: string,
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
    userId: string,
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
  async deleteInstagramAccount(userId: string): Promise<void> {
    const query = `
    DELETE FROM api.instagram_accounts
    WHERE user_id = $1
  `;

    await this.postgresqlService.query(query, [userId]);
  }
}
