import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { InfluencerEntity } from '../entities/influencer.entity';
import { PlatformType } from 'src/commons/enums/platform_type';
import { SocialNetworkEntity } from '../entities/social_network.entity';

@Injectable()
export class InfluencerRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  /**
   * Fetch a influencer by user id.
   * @param userId - The user's id.
   * @returns The user as an entity, or null if not found.
   */
  async getInfluencer(userId: string): Promise<InfluencerEntity | null> {
    const query = `
        SELECT * 
        FROM api.influencers
        WHERE user_id = $1
        LIMIT 1
      `;
    const result = await this.postgresqlService.query(query, [userId]);
    return result.length > 0 ? InfluencerEntity.fromJson(result[0]) : null;
  }

  /**
   * Update the profile picture of an influencer.
   * @param userId - The user's id.
   * @param profilePicture - The new profile picture URL.
   * @returns A boolean indicating if the update was successful.
   */
  async updateProfilePicture(
    userId: string,
    profilePicture: string,
  ): Promise<void> {
    const query = `
        UPDATE api.influencers
        SET profile_picture = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [profilePicture, userId]);
  }

  /**
   * Create a new influencer.
   * @param userId - The user's id.
   * @returns The created influencer as an entity.
   */
  async createInfluencer(userId: number): Promise<InfluencerEntity> {
    const query = `
        INSERT INTO api.influencers (user_id)
        VALUES ($1)
        RETURNING *
      `;
    const result = await this.postgresqlService.query(query, [userId]);
    return InfluencerEntity.fromJson(result[0]);
  }

  /**
   * Update the portfolio of an influencer.
   * @param userId - The user's id.
   * @param portfolio - The new portfolio data as an array of strings.
   */
  async updatePortfolio(userId: string, portfolio: string[]): Promise<void> {
    const query = `
        UPDATE api.influencers
        SET portfolio = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [portfolio, userId]);
  }

  /**
   * Update the name of an influencer.
   * @param userId - The user's id.
   * @param name - The new name.
   */
  async updateName(userId: string, name: string): Promise<void> {
    const query = `
        UPDATE api.influencers
        SET name = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [name, userId]);
  }

  /**
   * Update the department of an influencer.
   * @param userId - The user's id.
   * @param department - The new department.
   */
  async updateDepartment(userId: string, department: string): Promise<void> {
    const query = `
        UPDATE api.influencers
        SET department = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [department, userId]);
  }

  /**
   * Update the description of an influencer.
   * @param userId - The user's id.
   * @param description - The new description.
   */
  async updateDescription(userId: string, description: string): Promise<void> {
    const query = `
        UPDATE api.influencers
        SET description = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [description, userId]);
  }

  /**
   * Update the target audience of an influencer.
   * @param userId - The user's id.
   * @param targetAudience - The new target audience data as an array of strings.
   */
  async updateTargetAudience(
    userId: string,
    targetAudience: string[],
  ): Promise<void> {
    const query = `
        UPDATE api.influencers
        SET target_audience = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [targetAudience, userId]);
  }

  /**
   * Update the themes of an influencer.
   * @param userId - The user's id.
   * @param themes - The new themes data as an array of strings.
   */
  async updateThemes(userId: string, themes: string[]): Promise<void> {
    const query = `
        UPDATE api.influencers
        SET themes = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [themes, userId]);
  }

  /**
   * Create a new social network for an influencer.
   * @param influencerId - The influencer's id.
   * @param platform - The platform name (e.g., 'twitch', 'youtube', 'instagram', 'tiktok').
   * @param followers - The number of followers.
   * @param url - The URL of the social network profile.
   * @returns The created social network entity.
   */
  async createSocialNetwork(
    influencerId: number,
    platform: PlatformType,
    followers: number,
    url: string,
  ): Promise<void> {
    const query = `
        INSERT INTO api.social_networks (influencer_id, platform, followers, url)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
    await this.postgresqlService.query(query, [
      influencerId,
      platform,
      followers,
      url,
    ]);
  }

  /**
   * Fetch social networks by influencer id.
   * @param influencerId - The influencer's id.
   * @returns An array of social network entities.
   */
  async getSocialNetworks(
    influencerId: number,
  ): Promise<SocialNetworkEntity[]> {
    const query = `
        SELECT *
        FROM api.social_networks
        WHERE influencer_id = $1
      `;
    const result = await this.postgresqlService.query(query, [influencerId]);
    return result.map((row) => SocialNetworkEntity.fromJson(row));
  }

  /**
   * Delete a social network by its id.
   * @param socialNetworkId - The social network's id.
   */
  async deleteSocialNetwork(socialNetworkId: string): Promise<void> {
    const query = `
        DELETE FROM api.social_networks
        WHERE id = $1
      `;
    await this.postgresqlService.query(query, [socialNetworkId]);
  }

  /**
   * Update the URL of a social network by its id.
   * @param socialNetworkId - The social network's id.
   * @param url - The new URL of the social network profile.
   */
  async updateSocialNetwork(
    socialNetworkId: string,
    url: string,
  ): Promise<void> {
    const query = `
        UPDATE api.social_networks
        SET url = $1
        WHERE id = $2
      `;
    await this.postgresqlService.query(query, [url, socialNetworkId]);
  }

  /**
   * Fetch a social network by influencer id and platform type.
   * @param influencerId - The influencer's id.
   * @param platform - The platform type (e.g., 'twitch', 'youtube', 'instagram', 'tiktok').
   * @returns The social network entity, or null if not found.
   */
  async getSocialNetworkByType(
    influencerId: number,
    platform: PlatformType,
  ): Promise<SocialNetworkEntity | null> {
    const query = `
        SELECT *
        FROM api.social_networks
        WHERE influencer_id = $1 AND platform = $2
        LIMIT 1
      `;
    const result = await this.postgresqlService.query(query, [
      influencerId,
      platform,
    ]);
    return result.length > 0 ? SocialNetworkEntity.fromJson(result[0]) : null;
  }
}
