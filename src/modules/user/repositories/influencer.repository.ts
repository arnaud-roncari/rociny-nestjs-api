import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { InfluencerEntity } from '../entities/influencer.entity';

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
}
