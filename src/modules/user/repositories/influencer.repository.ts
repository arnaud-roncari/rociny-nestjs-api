import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { InfluencerEntity } from '../entities/influencer.entity';
import { PlatformType } from 'src/commons/enums/platform_type';
import { SocialNetworkEntity } from '../entities/social_network.entity';
import { LegalDocumentType } from 'src/commons/enums/legal_document_type';
import { LegalDocumentStatus } from 'src/commons/enums/legal_document_status';
import { LegalDocumentEntity } from '../entities/legal_document.entity';
import { InfluencerSummary } from '../entities/influencer_summary.entity';
import { InfluencerStatisticsEntity } from '../entities/influencer_statistics.entity';

@Injectable()
export class InfluencerRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  /**
   * Fetch an influencer by user id.
   * @param userId - The user's id.
   * @returns The user as an entity, or null if not found.
   */
  async getInfluencer(userId: number): Promise<InfluencerEntity | null> {
    const query = `
    SELECT 
      i.*,
      COALESCE(
        json_agg(sn) FILTER (WHERE sn.id IS NOT NULL), 
        '[]'
      ) AS social_networks,
      COALESCE(COUNT(DISTINCT col.id) FILTER (WHERE col.status = 'done'), 0) AS collaboration_amount,
      COALESCE(AVG(r.stars), 0) AS average_stars
    FROM api.influencers i
    LEFT JOIN api.social_networks sn 
      ON sn.influencer_id = i.id
    LEFT JOIN api.collaborations col 
      ON col.influencer_id = i.id
    LEFT JOIN api.reviews r 
      ON r.reviewed_id = i.user_id
    WHERE i.user_id = $1
    GROUP BY i.id
    LIMIT 1
  `;

    const result = await this.postgresqlService.query(query, [userId]);
    return result.length > 0 ? InfluencerEntity.fromJson(result[0]) : null;
  }

  /**
   * Fetch an influencer by their influencer id.
   * @param influencerId - The influencer's id.
   * @returns The influencer as an entity, or null if not found.
   */
  async getInfluencerById(
    influencerId: number,
  ): Promise<InfluencerEntity | null> {
    const query = `
    SELECT 
      i.*,
      COALESCE(COUNT(DISTINCT col.id) FILTER (WHERE col.status = 'done'), 0) AS collaboration_amount,
      COALESCE(AVG(r.stars), 0) AS average_stars
    FROM api.influencers i
    LEFT JOIN api.collaborations col 
      ON col.influencer_id = i.id
    LEFT JOIN api.reviews r 
      ON r.reviewed_id = i.user_id
    WHERE i.id = $1
    GROUP BY i.id
    LIMIT 1
  `;

    const result = await this.postgresqlService.query(query, [influencerId]);
    return result.length > 0 ? InfluencerEntity.fromJson(result[0]) : null;
  }

  /**
   * Update the profile picture of an influencer.
   * @param userId - The user's id.
   * @param profilePicture - The new profile picture URL.
   * @returns A boolean indicating if the update was successful.
   */
  async updateProfilePicture(
    userId: number,
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
  async createInfluencer(
    userId: number,
    stripeAccountId: string,
  ): Promise<InfluencerEntity> {
    const query = `
        INSERT INTO api.influencers (user_id, stripe_account_id)
        VALUES ($1, $2)
        RETURNING *
      `;
    const result = await this.postgresqlService.query(query, [
      userId,
      stripeAccountId,
    ]);
    return InfluencerEntity.fromJson(result[0]);
  }

  /**
   * Update the portfolio of an influencer.
   * @param userId - The user's id.
   * @param portfolio - The new portfolio data as an array of strings.
   */
  async updatePortfolio(userId: number, portfolio: string[]): Promise<void> {
    const query = `
        UPDATE api.influencers
        SET portfolio = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [portfolio, userId]);
  }

  /**
   * Add multiple photos to the portfolio of an influencer.
   * @param userId - The user's id.
   * @param newPictures - An array of photo URLs to add.
   */
  async addPicturesToPortfolio(
    userId: number,
    newPictures: string[],
  ): Promise<void> {
    const result = await this.postgresqlService.query(
      `SELECT portfolio FROM api.influencers WHERE user_id = $1`,
      [userId],
    );

    const currentPortfolio: string[] = result[0]?.portfolio || [];
    const updatedPortfolio = [...currentPortfolio, ...newPictures];

    await this.postgresqlService.query(
      `UPDATE api.influencers SET portfolio = $1 WHERE user_id = $2`,
      [updatedPortfolio, userId],
    );
  }

  /**
   * Remove a photo from the portfolio of an influencer.
   * @param userId - The user's id.
   * @param pictureUrl - The exact photo URL to remove.
   */
  async removePictureFromPortfolio(
    userId: number,
    pictureUrl: string,
  ): Promise<void> {
    const result = await this.postgresqlService.query(
      `SELECT portfolio FROM api.influencers WHERE user_id = $1`,
      [userId],
    );

    const currentPortfolio: string[] = result[0]?.portfolio || [];
    const updatedPortfolio = currentPortfolio.filter(
      (photo) => photo !== pictureUrl,
    );

    await this.postgresqlService.query(
      `UPDATE api.influencers SET portfolio = $1 WHERE user_id = $2`,
      [updatedPortfolio, userId],
    );
  }

  /**
   * Update the name of an influencer.
   * @param userId - The user's id.
   * @param name - The new name.
   */
  async updateName(userId: number, name: string): Promise<void> {
    const query = `
        UPDATE api.influencers
        SET name = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [name, userId]);
  }

  async updateVATNumber(userId: number, vatNumber: string): Promise<void> {
    const query = `
        UPDATE api.influencers
        SET vat_number = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [vatNumber, userId]);
  }

  /**
   * Update the department of an influencer.
   * @param userId - The user's id.
   * @param department - The new department.
   */
  async updateDepartment(userId: number, department: string): Promise<void> {
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
  async updateDescription(userId: number, description: string): Promise<void> {
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
    userId: number,
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
  async updateThemes(userId: number, themes: string[]): Promise<void> {
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

  /**
   * Adds a new legal document to the database for a specific influencer.
   *
   * @param influencerId - The ID of the influencer for whom the legal document is being added.
   * @param type - The type of the legal document (e.g., contract, agreement, etc.).
   * @param status - The current status of the legal document (e.g., active, pending, etc.).
   * @param document - The document's content or a reference to the document.
   *
   * @returns A `LegalDocumentEntity` object if the document is successfully added, otherwise `null`.
   */
  async addLegalDocument(
    influencerId: number,
    type: LegalDocumentType,
    status: LegalDocumentStatus,
    document: string,
  ): Promise<LegalDocumentEntity | null> {
    const query = `
    INSERT INTO api.legal_documents (influencer_id, type, status, document)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
    const result = await this.postgresqlService.query(query, [
      influencerId,
      type,
      status,
      document,
    ]);
    return result.length > 0 ? LegalDocumentEntity.fromJson(result[0]) : null;
  }

  /**
   * Deletes a legal document from the database based on its ID.
   *
   * @param id - The unique identifier of the legal document to be deleted.
   *
   * @returns A `Promise` that resolves when the operation completes. The result is void,
   *          as the method does not return any value. The absence of errors indicates success.
   */
  async deleteLegalDocument(id: string): Promise<void> {
    const query = `
    DELETE FROM api.legal_documents 
    WHERE id = $1
    RETURNING id
  `;
    await this.postgresqlService.query(query, [id]);
  }

  /**
   * Retrieves the legal document for a specific influencer based on the document type.
   *
   * @param influencerId - The ID of the influencer whose legal document is being retrieved.
   * @param type - The type of the legal document to be retrieved (e.g., contract, agreement, etc.).
   *
   * @returns A `LegalDocumentEntity` object if the document is found, otherwise `null`.
   */
  async getLegalDocumentByType(
    influencerId: number,
    type: LegalDocumentType,
  ): Promise<LegalDocumentEntity | null> {
    const query = `
    SELECT * FROM api.legal_documents
    WHERE influencer_id = $1 AND type = $2
    LIMIT 1
  `;
    const result = await this.postgresqlService.query(query, [
      influencerId,
      type,
    ]);
    return result.length > 0 ? LegalDocumentEntity.fromJson(result[0]) : null;
  }

  /**
   * Checks if a user has submitted and had validated all required legal documents.
   *
   * @param userId - The ID of the influencer to check.
   * @param requiredTypes - An array of required legal document types (enums).
   *
   * @returns A Promise that resolves to true if the user has submitted all required documents
   *         with the status 'validated', otherwise false.
   */
  async hasCompletedLegalDocuments(
    influencerId: number,
    requiredTypes: LegalDocumentType[],
  ): Promise<boolean> {
    if (requiredTypes.length === 0) {
      return true;
    }

    const query = `
    SELECT COUNT(DISTINCT type) AS count
    FROM api.legal_documents
    WHERE influencer_id = $1
      AND status = 'validated'
      AND type = ANY($2::text[])
  `;

    const result = await this.postgresqlService.query(query, [
      influencerId,
      requiredTypes,
    ]);

    const count = parseInt(result[0]?.count ?? '0', 10);

    return count === requiredTypes.length;
  }

  async searchInfluencersByTheme(theme?: string): Promise<InfluencerSummary[]> {
    const baseQuery = `
    SELECT 
      i.id,
      i.user_id,
      i.profile_picture,
      i.portfolio,
      i.name,
      insta.followers_count,
      COALESCE(COUNT(DISTINCT col.id) FILTER (WHERE col.status = 'done'), 0) AS collaboration_amount,
      COALESCE(AVG(r.stars), 0) AS average_stars
    FROM api.influencers i
    JOIN api.social_networks sn ON sn.influencer_id = i.id
    JOIN api.instagram_accounts insta ON insta.user_id = i.user_id
    LEFT JOIN api.collaborations col ON col.influencer_id = i.id
    LEFT JOIN api.reviews r ON r.reviewed_id = i.user_id
    WHERE 
      i.profile_picture IS NOT NULL
      AND i.name IS NOT NULL
      AND i.department IS NOT NULL
      AND i.description IS NOT NULL
      AND cardinality(i.themes) > 0
      AND cardinality(i.target_audience) > 0
      AND cardinality(i.portfolio) > 0
      ${theme ? `AND $1 = ANY(i.themes)` : ''}
    GROUP BY i.id, insta.followers_count
    LIMIT 50
  `;

    const result = theme
      ? await this.postgresqlService.query(baseQuery, [theme])
      : await this.postgresqlService.query(baseQuery);

    return result.map((row) => InfluencerSummary.fromJson(row));
  }

  async searchInfluencersByFilters(
    themes?: string[],
    departments?: string[],
    ages?: string[],
    targets?: string[],
    followersRange?: number[],
    engagementRateRange?: number[],
  ): Promise<InfluencerSummary[]> {
    const filters: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const baseQuery = `
    SELECT 
      i.id,
      i.user_id,
      i.profile_picture,
      i.portfolio,
      i.name,
      insta.followers_count,
      COALESCE(COUNT(DISTINCT col.id) FILTER (WHERE col.status = 'done'), 0) AS collaboration_amount,
      COALESCE(AVG(r.stars), 0) AS average_stars
    FROM api.influencers i
    JOIN api.social_networks sn ON sn.influencer_id = i.id
    JOIN api.instagram_accounts insta ON insta.user_id = i.user_id
    LEFT JOIN api.collaborations col ON col.influencer_id = i.id
    LEFT JOIN api.reviews r ON r.reviewed_id = i.user_id
    WHERE 
      i.profile_picture IS NOT NULL
      AND i.name IS NOT NULL
      AND i.department IS NOT NULL
      AND i.description IS NOT NULL
      AND cardinality(i.themes) > 0
      AND cardinality(i.target_audience) > 0
      AND cardinality(i.portfolio) > 0
  `;

    // Query construction based on provided filters
    if (themes && themes.length > 0) {
      filters.push(
        `(${themes.map(() => `$${paramIndex++} = ANY(i.themes)`).join(' OR ')})`,
      );
      values.push(...themes);
    }

    if (departments && departments.length > 0) {
      filters.push(`i.department = ANY($${paramIndex++})`);
      values.push(departments);
    }

    if (targets && targets.length > 0) {
      filters.push(
        `(${targets.map(() => `$${paramIndex++} = ANY(i.target_audience)`).join(' OR ')})`,
      );
      values.push(...targets);
    }

    if (ages && ages.length > 0) {
      filters.push(
        `(${ages.map(() => `$${paramIndex++} = ANY(insta.top_age_ranges)`).join(' OR ')})`,
      );
      values.push(...ages);
    }

    if (followersRange && followersRange.length === 2) {
      filters.push(
        `insta.followers_count BETWEEN $${paramIndex} AND $${paramIndex + 1}`,
      );
      values.push(followersRange[0], followersRange[1]);
      paramIndex += 2;
    }

    if (engagementRateRange && engagementRateRange.length === 2) {
      filters.push(
        `insta.engagement_rate BETWEEN $${paramIndex} AND $${paramIndex + 1}`,
      );
      values.push(engagementRateRange[0], engagementRateRange[1]);
      paramIndex += 2;
    }

    const whereClause =
      filters.length > 0 ? ` AND ${filters.join(' AND ')}` : '';
    const finalQuery = `
    ${baseQuery}
    ${whereClause}
    GROUP BY i.id, insta.followers_count
    LIMIT 50
  `;

    const result = await this.postgresqlService.query(finalQuery, values);
    return result.map((row) => InfluencerSummary.fromJson(row));
  }

  /**
   * Increment profile views by inserting a new record into influencer_profile_views.
   * @param userId - The influencer's user ID.
   * @param companyId - The ID of the company viewing the profile.
   */
  async incrementProfileViews(userId: number): Promise<void> {
    const query = `
    INSERT INTO api.influencer_profile_views (influencer_id, viewed_at)
    SELECT i.id, NOW()
    FROM api.influencers i
    WHERE i.user_id = $1
  `;
    await this.postgresqlService.query(query, [userId]);
  }

  async getStatistics(userId: number): Promise<InfluencerStatisticsEntity> {
    const query = `
    WITH last_30_days_collaborations AS (
      SELECT *
      FROM api.collaborations
      WHERE influencer_id = (SELECT id FROM api.influencers WHERE user_id = $1)
        AND created_at >= NOW() - INTERVAL '30 days'
        AND status = 'done'
    )
    SELECT 
      -- total revenue from product placements
      COALESCE(SUM(pp.price), 0) AS revenue,
      
      -- average rating from reviews on these collaborations
      COALESCE(AVG(r.stars), 0) AS average_rating,
      
      -- profile views in the last 30 days
      (
        SELECT COUNT(*) 
        FROM api.influencer_profile_views pv
        JOIN api.influencers i ON i.id = pv.influencer_id
        WHERE i.user_id = $1
          AND pv.viewed_at >= NOW() - INTERVAL '30 days'
      ) AS profile_views,
      
      -- number of collaborations
      COUNT(c.*) AS collaborations_count,
      
      -- number of placements
      COALESCE(COUNT(pp.id), 0) AS placements_count
      
    FROM last_30_days_collaborations c
    LEFT JOIN api.reviews r ON r.collaboration_id = c.id
    LEFT JOIN api.product_placements pp ON pp.collaboration_id = c.id
  `;

    const result = await this.postgresqlService.query(query, [userId]);
    return InfluencerStatisticsEntity.fromJson(result[0]);
  }

  async updateSiret(userId: number, siret: string): Promise<void> {
    const query = `
    UPDATE api.influencers
    SET siret = $1
    WHERE user_id = $2
  `;
    await this.postgresqlService.query(query, [siret, userId]);
  }
}
