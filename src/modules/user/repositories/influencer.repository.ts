import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { InfluencerEntity } from '../entities/influencer.entity';
import { PlatformType } from 'src/commons/enums/platform_type';
import { SocialNetworkEntity } from '../entities/social_network.entity';
import { LegalDocumentType } from 'src/commons/enums/legal_document_type';
import { LegalDocumentStatus } from 'src/commons/enums/legal_document_status';
import { LegalDocumentEntity } from '../entities/legal_document.entity';

@Injectable()
export class InfluencerRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  /**
   * Fetch a influencer by user id.
   * @param userId - The user's id.
   * @returns The user as an entity, or null if not found.
   */
  async getInfluencer(userId: number): Promise<InfluencerEntity | null> {
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
}
