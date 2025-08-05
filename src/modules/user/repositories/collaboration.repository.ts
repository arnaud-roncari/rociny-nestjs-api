import { Injectable } from '@nestjs/common';
import { PostgresqlService } from 'src/modules/postgresql/postgresql.service';
import { CreateCollaborationDto } from '../dtos/create-collaboration.dto';
import { CollaborationEntity } from '../entities/collaboration.entity';
import { ProductPlacementEntity } from '../entities/product_placement.entity';

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
}
