import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { CompanyEntity } from '../entities/company.entity';
import { PlatformType } from 'src/commons/enums/platform_type';
import { SocialNetworkEntity } from '../entities/social_network.entity';
import { LegalDocumentType } from 'src/commons/enums/legal_document_type';
import { LegalDocumentStatus } from 'src/commons/enums/legal_document_status';
import { LegalDocumentEntity } from '../entities/legal_document.entity';

@Injectable()
export class CompanyRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  /**
   * Fetch a company by user id.
   * @param userId - The user's id.
   * @returns The user as an entity, or null if not found.
   */
  async getCompany(userId: number): Promise<CompanyEntity | null> {
    const query = `
          SELECT * 
          FROM api.companies
          WHERE user_id = $1
          LIMIT 1
        `;
    const result = await this.postgresqlService.query(query, [userId]);
    return result.length > 0 ? CompanyEntity.fromJson(result[0]) : null;
  }

  async getCompanyById(id: number): Promise<CompanyEntity | null> {
    const query = `
          SELECT * 
          FROM api.companies
          WHERE id = $1
          LIMIT 1
        `;
    const result = await this.postgresqlService.query(query, [id]);
    return result.length > 0 ? CompanyEntity.fromJson(result[0]) : null;
  }

  /**
   * Create a new compaany.
   * @param userId - The user's id.
   * @returns The created company as an entity.
   */
  async createCompany(
    userId: number,
    customerId: string,
  ): Promise<CompanyEntity> {
    const query = `
        INSERT INTO api.companies (user_id, stripe_customer_id)
        VALUES ($1, $2)
        RETURNING *
      `;
    const result = await this.postgresqlService.query(query, [
      userId,
      customerId,
    ]);
    return CompanyEntity.fromJson(result[0]);
  }

  /**
   * Update the profile picture of an company.
   * @param userId - The user's id.
   * @param profilePicture - The new profile picture URL.
   * @returns A boolean indicating if the update was successful.
   */
  async updateProfilePicture(
    userId: number,
    profilePicture: string,
  ): Promise<void> {
    const query = `
        UPDATE api.companies
        SET profile_picture = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [profilePicture, userId]);
  }
  /**
   * Update the name of an company.
   * @param userId - The user's id.
   * @param name - The new name.
   */
  async updateName(userId: number, name: string): Promise<void> {
    const query = `
        UPDATE api.companies
        SET name = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [name, userId]);
  }

  async updateVATNumber(userId: number, name: string): Promise<void> {
    const query = `
        UPDATE api.companies
        SET vat_number = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [name, userId]);
  }

  async updateTradeName(userId: number, tradeName: string): Promise<void> {
    const query = `
        UPDATE api.companies
        SET trade_name = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [tradeName, userId]);
  }

  async updateBillingAddress(
    userId: number,
    city: string,
    street: string,
    postalCode: string,
  ): Promise<void> {
    const query = `
        UPDATE api.companies
        SET city = $1, street = $2, postal_code = $3 
        WHERE user_id = $4
      `;
    await this.postgresqlService.query(query, [
      city,
      street,
      postalCode,
      userId,
    ]);
  }

  /**
   * Update the department of an company.
   * @param userId - The user's id.
   * @param department - The new department.
   */
  async updateDepartment(userId: number, department: string): Promise<void> {
    const query = `
        UPDATE api.companies
        SET department = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [department, userId]);
  }

  /**
   * Update the description of an company.
   * @param userId - The user's id.
   * @param description - The new description.
   */
  async updateDescription(userId: number, description: string): Promise<void> {
    const query = `
        UPDATE api.companies
        SET description = $1
        WHERE user_id = $2
      `;
    await this.postgresqlService.query(query, [description, userId]);
  }

  /**
   * Create a new social network for an company.
   * @param companyId - The company's id.
   * @param platform - The platform name (e.g., 'twitch', 'youtube', 'instagram', 'tiktok').
   * @param followers - The number of followers.
   * @param url - The URL of the social network profile.
   * @returns The created social network entity.
   */
  async createSocialNetwork(
    companyId: number,
    platform: PlatformType,
    followers: number,
    url: string,
  ): Promise<void> {
    const query = `
          INSERT INTO api.social_networks (company_id, platform, followers, url)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
    await this.postgresqlService.query(query, [
      companyId,
      platform,
      followers,
      url,
    ]);
  }

  /**
   * Fetch social networks by company id.
   * @param companyId - The company's id.
   * @returns An array of social network entities.
   */
  async getSocialNetworks(companyId: number): Promise<SocialNetworkEntity[]> {
    const query = `
          SELECT *
          FROM api.social_networks
          WHERE company_id = $1
        `;
    const result = await this.postgresqlService.query(query, [companyId]);
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
   * Fetch a social network by company id and platform type.
   * @param companyId - The company's id.
   * @param platform - The platform type (e.g., 'twitch', 'youtube', 'instagram', 'tiktok').
   * @returns The social network entity, or null if not found.
   */
  async getSocialNetworkByType(
    companyId: number,
    platform: PlatformType,
  ): Promise<SocialNetworkEntity | null> {
    const query = `
          SELECT *
          FROM api.social_networks
          WHERE company_id = $1 AND platform = $2
          LIMIT 1
        `;
    const result = await this.postgresqlService.query(query, [
      companyId,
      platform,
    ]);
    return result.length > 0 ? SocialNetworkEntity.fromJson(result[0]) : null;
  }

  /**
   * Adds a new legal document to the database for a specific company.
   *
   * @param companyId - The ID of the company for whom the legal document is being added.
   * @param type - The type of the legal document (e.g., contract, agreement, etc.).
   * @param status - The current status of the legal document (e.g., active, pending, etc.).
   * @param document - The document's content or a reference to the document.
   *
   * @returns A `LegalDocumentEntity` object if the document is successfully added, otherwise `null`.
   */
  async addLegalDocument(
    companyId: number,
    type: LegalDocumentType,
    status: LegalDocumentStatus,
    document: string,
  ): Promise<LegalDocumentEntity | null> {
    const query = `
      INSERT INTO api.legal_documents (company_id, type, status, document)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await this.postgresqlService.query(query, [
      companyId,
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
   * Retrieves the legal document for a specific company based on the document type.
   *
   * @param companyId - The ID of the company whose legal document is being retrieved.
   * @param type - The type of the legal document to be retrieved (e.g., contract, agreement, etc.).
   *
   * @returns A `LegalDocumentEntity` object if the document is found, otherwise `null`.
   */
  async getLegalDocumentByType(
    companyId: number,
    type: LegalDocumentType,
  ): Promise<LegalDocumentEntity | null> {
    const query = `
      SELECT * FROM api.legal_documents
      WHERE company_id = $1 AND type = $2
      LIMIT 1
    `;
    const result = await this.postgresqlService.query(query, [companyId, type]);
    return result.length > 0 ? LegalDocumentEntity.fromJson(result[0]) : null;
  }

  /**
   * Checks if a user has submitted and had validated all required legal documents.
   *
   * @param userId - The ID of the company to check.
   * @param requiredTypes - An array of required legal document types (enums).
   *
   * @returns A Promise that resolves to true if the user has submitted all required documents
   *         with the status 'validated', otherwise false.
   */
  async hasCompletedLegalDocuments(
    companyId: number,
    requiredTypes: LegalDocumentType[],
  ): Promise<boolean> {
    if (requiredTypes.length === 0) {
      return true;
    }

    const query = `
      SELECT COUNT(DISTINCT type) AS count
      FROM api.legal_documents
      WHERE company_id = $1
        AND status = 'validated'
        AND type = ANY($2::text[])
    `;

    const result = await this.postgresqlService.query(query, [
      companyId,
      requiredTypes,
    ]);

    const count = parseInt(result[0]?.count ?? '0', 10);

    return count === requiredTypes.length;
  }
}
