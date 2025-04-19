import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { CompanyEntity } from '../entities/company.entity';

@Injectable()
export class CompanyRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  /**
   * Create a new compaany.
   * @param userId - The user's id.
   * @returns The created influencer as an entity.
   */
  async createCompany(userId: number): Promise<CompanyEntity> {
    const query = `
        INSERT INTO api.companies (user_id)
        VALUES ($1)
        RETURNING *
      `;
    const result = await this.postgresqlService.query(query, [userId]);
    return CompanyEntity.fromJson(result[0]);
  }
}
