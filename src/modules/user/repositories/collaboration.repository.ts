import { Injectable } from '@nestjs/common';
import { PostgresqlService } from 'src/modules/postgresql/postgresql.service';
import { CreateCollaborationDto } from '../dtos/create-collaboration.dto';
import { CollaborationEntity } from '../entities/collaboration.entity';
import { ProductPlacementEntity } from '../entities/product_placement.entity';
import { CollaborationSummaryEntity } from '../entities/collaboration_summary.entity';
import { ReviewEntity } from '../entities/review.entity';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { ReviewSummaryEntity } from '../entities/review_summary.entity';
import { CollaboratedCompanyEntity } from '../entities/collaborated_company_entity';
import { InfluencerSummary } from '../entities/influencer_summary.entity';

@Injectable()
export class CollaborationRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  /**
   * Creates a new collaboration with its associated product placements.
   *
   * @param dto - The collaboration data to insert.
   * @param status - The initial status of the collaboration.
   * @returns The ID of the newly created collaboration.
   */
  async createCollaboration(
    dto: CreateCollaborationDto,
    companyId: number,
    status: string,
  ): Promise<number> {
    const { influencer_id, title, product_placements } = dto;

    const client = await this.postgresqlService.getClient();
    try {
      await client.query('BEGIN');

      const insertCollabQuery = `
        INSERT INTO api.collaborations (company_id, influencer_id, title, status)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      const collabResult = await client.query(insertCollabQuery, [
        companyId,
        influencer_id,
        title,
        status,
      ]);
      const collaborationId = collabResult.rows[0].id;

      const insertPPQuery = `
        INSERT INTO api.product_placements (collaboration_id, type, quantity, description, price)
        VALUES ($1, $2, $3, $4, $5)
      `;

      for (const pp of product_placements) {
        await client.query(insertPPQuery, [
          collaborationId,
          pp.type,
          pp.quantity,
          pp.description,
          pp.price,
        ]);
      }

      await client.query('COMMIT');
      return collaborationId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Updates the status of a collaboration.
   *
   * @param id - The ID of the collaboration to update.
   * @param status - The new status to apply.
   */
  async updateCollaborationStatus(id: number, status: string): Promise<void> {
    const query = `UPDATE api.collaborations SET status = $1 WHERE id = $2`;
    await this.postgresqlService.query(query, [status, id]);
  }

  /**
   * Updates only the invoice fields of a collaboration.
   *
   * @param id - The ID of the collaboration to update.
   * @param rocinyInvoice - Rociny invoice filename or URL.
   * @param influencerInvoice - Influencer invoice filename or URL.
   */
  async updateCollaborationInvoices(
    id: number,
    rocinyInvoice: string,
    influencerInvoice: string,
  ): Promise<void> {
    const query = `
    UPDATE api.collaborations
    SET platform_invoice = $1,
        influencer_invoice = $2
    WHERE id = $3
  `;
    await this.postgresqlService.query(query, [
      rocinyInvoice,
      influencerInvoice,
      id,
    ]);
  }

  /**
   * Updates only the quote fields of a collaboration.
   *
   * @param id - The ID of the collaboration to update.
   * @param rocinyQuote - Rociny quote filename or URL.
   * @param influencerQuote - Influencer quote filename or URL.
   */
  async updateCollaborationQuotes(
    id: number,
    rocinyQuote: string,
    influencerQuote: string,
  ): Promise<void> {
    const query = `
    UPDATE api.collaborations
    SET platform_quote = $1,
        influencer_quote = $2
    WHERE id = $3
  `;
    await this.postgresqlService.query(query, [
      rocinyQuote,
      influencerQuote,
      id,
    ]);
  }

  /**
   * Fetches all product placements linked to a specific collaboration.
   *
   * @param collaborationId - The ID of the collaboration.
   * @returns A list of product placements.
   */
  private async getProductPlacements(
    collaborationId: number,
  ): Promise<ProductPlacementEntity[]> {
    const query = `
      SELECT * FROM api.product_placements WHERE collaboration_id = $1 ORDER BY created_at ASC
    `;
    const placements = await this.postgresqlService.query(query, [
      collaborationId,
    ]);
    return ProductPlacementEntity.fromJsons(placements);
  }

  /**
   * Retrieves a single collaboration by its ID, including its product placements.
   *
   * @param id - The ID of the collaboration.
   * @returns The collaboration entity, or null if not found.
   */
  async findById(id: number): Promise<CollaborationEntity | null> {
    const collaborationQuery = `
      SELECT * FROM api.collaborations WHERE id = $1 LIMIT 1
    `;
    const [collab] = await this.postgresqlService.query(collaborationQuery, [
      id,
    ]);

    if (!collab) return null;

    const productPlacements = await this.getProductPlacements(collab.id);

    return CollaborationEntity.fromJson({
      ...collab,
      product_placements: productPlacements,
    });
  }

  /**
   * Retrieves all collaborations belonging to a given company.
   *
   * @param companyId - The company ID.
   * @returns A list of collaboration entities.
   */
  async findByCompany(companyId: number): Promise<CollaborationEntity[]> {
    const query = `
      SELECT * FROM api.collaborations WHERE company_id = $1 ORDER BY created_at DESC
    `;
    const collabs = await this.postgresqlService.query(query, [companyId]);

    const results: CollaborationEntity[] = [];

    for (const collab of collabs) {
      const placements = await this.getProductPlacements(collab.id);
      results.push(
        CollaborationEntity.fromJson({
          ...collab,
          product_placements: placements,
        }),
      );
    }

    return results;
  }

  /**
   * Retrieves all collaborations assigned to a given influencer.
   *
   * @param influencerId - The influencer's user ID.
   * @returns A list of collaboration entities.
   */
  async findByInfluencer(influencerId: number): Promise<CollaborationEntity[]> {
    const query = `
      SELECT * FROM api.collaborations WHERE influencer_id = $1 ORDER BY created_at DESC
    `;
    const collabs = await this.postgresqlService.query(query, [influencerId]);

    const results: CollaborationEntity[] = [];

    for (const collab of collabs) {
      const placements = await this.getProductPlacements(collab.id);
      results.push(
        CollaborationEntity.fromJson({
          ...collab,
          product_placements: placements,
        }),
      );
    }

    return results;
  }
  /**
   * Update the list of files for a given collaboration.
   * @param collaborationId - The ID of the collaboration to update.
   * @param files - Array of file URLs to add.
   */
  async updateCollaborationFiles(
    collabId: number,
    files: string[],
  ): Promise<void> {
    const query = `
    UPDATE api.collaborations
    SET files = $1
    WHERE id = $2
  `;
    await this.postgresqlService.query(query, [files, collabId]);
  }

  async getSummariesByCompany(
    companyId: number,
  ): Promise<CollaborationSummaryEntity[]> {
    const query = `
    SELECT
      i.name               AS influencer_name,
      i.user_id            AS influencer_user_id,
      i.profile_picture    AS influencer_profile_picture,
      c.title              AS collaboration_title,
      COALESCE(SUM(pp.price), 0)    AS collaboration_price, 
      c.status             AS collaboration_status,
      c.id                 AS collaboration_id,
      COALESCE(SUM(pp.quantity), 0) AS placements_count,
      co.name              AS company_name,
      co.profile_picture   AS company_profile_picture,
      co.user_id           AS company_user_id
    FROM api.collaborations c
    JOIN api.influencers i 
      ON i.id = c.influencer_id
    JOIN api.companies co 
      ON co.id = c.company_id
    LEFT JOIN api.product_placements pp 
      ON pp.collaboration_id = c.id
    WHERE c.company_id = $1
    GROUP BY 
      c.id, i.name, i.user_id, i.profile_picture, 
      c.title, c.status,
      co.name, co.profile_picture, co.user_id
    ORDER BY c.created_at DESC
  `;

    const rows = await this.postgresqlService.query(query, [companyId]);
    return CollaborationSummaryEntity.fromJsons(rows);
  }

  async getSummariesByInfluencer(
    influencerId: number,
  ): Promise<CollaborationSummaryEntity[]> {
    const query = `
    SELECT
      i.name               AS influencer_name,
      i.user_id            AS influencer_user_id,
      i.profile_picture    AS influencer_profile_picture,
      c.title              AS collaboration_title,
      COALESCE(SUM(pp.price), 0)    AS collaboration_price, 
      c.status             AS collaboration_status,
      c.id                 AS collaboration_id,
      COALESCE(SUM(pp.quantity), 0) AS placements_count,
      co.name              AS company_name,
      co.profile_picture   AS company_profile_picture,
      co.user_id           AS company_user_id
    FROM api.collaborations c
    JOIN api.influencers i 
      ON i.id = c.influencer_id
    JOIN api.companies co 
      ON co.id = c.company_id
    LEFT JOIN api.product_placements pp 
      ON pp.collaboration_id = c.id
    WHERE c.influencer_id = $1
    GROUP BY 
      c.id, i.name, i.user_id, i.profile_picture, 
      c.title, c.status,
      co.name, co.profile_picture, co.user_id
    ORDER BY c.created_at DESC
  `;

    const rows = await this.postgresqlService.query(query, [influencerId]);
    return CollaborationSummaryEntity.fromJsons(rows);
  }

  async getReview(
    collaborationId: number,
    authorId: number,
    reviewedId: number,
  ): Promise<ReviewEntity | null> {
    const q = `
      SELECT *
      FROM api.reviews
      WHERE collaboration_id = $1 AND author_id = $2 AND reviewed_id = $3
      LIMIT 1
    `;
    const rows = await this.postgresqlService.query(q, [
      collaborationId,
      authorId,
      reviewedId,
    ]);
    return rows[0] ? ReviewEntity.fromJson(rows[0]) : null;
  }

  async getReviewsByAuthor(authorId: number): Promise<ReviewEntity[]> {
    const q = `
      SELECT *
      FROM api.reviews
      WHERE author_id = $1
      ORDER BY created_at DESC
    `;
    const rows = await this.postgresqlService.query(q, [authorId]);
    return ReviewEntity.fromJsons(rows);
  }

  async getReviewsByReviewed(reviewedId: number): Promise<ReviewEntity[]> {
    const q = `
      SELECT *
      FROM api.reviews
      WHERE reviewed_id = $1
      ORDER BY created_at DESC
    `;
    const rows = await this.postgresqlService.query(q, [reviewedId]);
    return ReviewEntity.fromJsons(rows);
  }

  async createReview(
    collaborationId: number,
    authorId: number,
    reviewedId: number,
    stars: number,
    description: string,
  ): Promise<number> {
    const q = `
      INSERT INTO api.reviews (collaboration_id, author_id, reviewed_id, stars, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const rows = await this.postgresqlService.query(q, [
      collaborationId,
      authorId,
      reviewedId,
      stars,
      description,
    ]);
    return rows[0].id as number;
  }

  async getInfluencerReviewSummaries(
    userId: number,
  ): Promise<ReviewSummaryEntity[]> {
    const q = `
    SELECT u.id AS "user_id",
           c.name,
           c.profile_picture AS "profile_picture",
           r.description
    FROM api.reviews r
    JOIN api.companies c ON r.author_id = c.user_id
    JOIN api.users u ON u.id = c.user_id
    WHERE r.reviewed_id = $1
      AND r.description IS NOT NULL
      AND r.description <> ''
  `;
    const rows = await this.postgresqlService.query(q, [userId]);
    return ReviewSummaryEntity.fromJsons(rows);
  }

  async getCompanyReviewSummaries(
    userId: number,
  ): Promise<ReviewSummaryEntity[]> {
    const q = `
    SELECT u.id AS "user_id",
           i.name,
           i.profile_picture AS "profile_picture",
           r.description
    FROM api.reviews r
    JOIN api.influencers i ON r.author_id = i.user_id
    JOIN api.users u ON u.id = i.user_id
    WHERE r.reviewed_id = $1
      AND r.description IS NOT NULL
      AND r.description <> ''
  `;
    const rows = await this.postgresqlService.query(q, [userId]);
    return ReviewSummaryEntity.fromJsons(rows);
  }

  async getCollaboratedCompany(
    influencerUserId: number,
  ): Promise<CollaboratedCompanyEntity[]> {
    const q = `
    SELECT DISTINCT c.id,
           c.user_id,
           c.name,
           c.profile_picture
    FROM api.collaborations col
    JOIN api.companies c ON col.company_id = c.id
    WHERE col.influencer_id = (
      SELECT id FROM api.influencers WHERE user_id = $1
    )
  `;
    const rows = await this.postgresqlService.query(q, [influencerUserId]);
    return CollaboratedCompanyEntity.fromJsons(rows);
  }

  async getCollaboratedInfluencers(
    companyUserId: number,
  ): Promise<InfluencerSummary[]> {
    const q = `
    SELECT 
      i.id,
      i.user_id,
      i.name,
      i.profile_picture,
      i.portfolio,
      insta.followers_count,
      COALESCE(COUNT(DISTINCT col.id) FILTER (WHERE col.status = 'done'), 0) AS collaboration_amount,
      COALESCE(AVG(r.stars), 0) AS average_stars
    FROM api.collaborations col
    JOIN api.influencers i ON col.influencer_id = i.id
    JOIN api.instagram_accounts insta ON insta.user_id = i.user_id
    LEFT JOIN api.reviews r ON r.reviewed_id = i.user_id
    WHERE col.company_id = (
      SELECT id FROM api.companies WHERE user_id = $1
    )
    GROUP BY i.id, i.user_id, i.name, i.profile_picture, i.portfolio, insta.followers_count
  `;

    const rows = await this.postgresqlService.query(q, [companyUserId]);
    return InfluencerSummary.fromJsons(rows);
  }

  /**
   * Get the average stars of an influencer by their user_id,
   * based only on "done" collaborations.
   * @param userId - The user id of the influencer.
   * @returns The average stars (number), or 0 if no reviews exist.
   */
  async getInfluencerAverageStars(userId: number): Promise<number> {
    const query = `
    SELECT COALESCE(AVG(r.stars), 0)::float AS average_stars
    FROM api.reviews r
    JOIN api.collaborations c ON r.collaboration_id = c.id
    JOIN api.influencers i ON i.id = c.influencer_id
    WHERE i.user_id = $1
      AND c.status = 'done'
  `;

    const rows = await this.postgresqlService.query(query, [userId]);
    return rows.length > 0 ? rows[0].average_stars : 0;
  }

  async getRecentCollaborationsByInfluencerId(
    influencerUserId: number,
  ): Promise<CollaborationSummaryEntity[]> {
    const query = `
    SELECT 
      i.user_id            AS influencer_user_id,
      comp.user_id         AS company_user_id,
      i.name               AS influencer_name,
      i.profile_picture    AS influencer_profile_picture,
      comp.name            AS company_name,
      comp.profile_picture AS company_profile_picture,
      col.title            AS collaboration_title,
      COALESCE(SUM(pp.price), 0) AS collaboration_price,
      col.id               AS collaboration_id,
      col.status           AS collaboration_status,
      COALESCE(SUM(pp.quantity), 0) AS placements_count
    FROM api.collaborations col
    JOIN api.influencers i 
      ON col.influencer_id = i.id
    JOIN api.companies comp 
      ON col.company_id = comp.id
    LEFT JOIN api.product_placements pp 
      ON pp.collaboration_id = col.id
    WHERE i.user_id = $1
      AND col.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY 
      i.user_id, 
      comp.user_id, 
      i.name, 
      i.profile_picture, 
      comp.name, 
      comp.profile_picture, 
      col.title, 
      col.id, 
      col.status
    ORDER BY col.created_at DESC
  `;
    const rows = await this.postgresqlService.query(query, [influencerUserId]);
    return CollaborationSummaryEntity.fromJsons(rows);
  }
}
