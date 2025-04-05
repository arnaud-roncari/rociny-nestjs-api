import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  /**
   * Fetch a user by email.
   * @param email - The user's email.
   * @returns The user as an entity, or null if not found.
   */
  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const query = `
      SELECT * 
      FROM api.users
      WHERE email = $1
      LIMIT 1
    `;
    const result = await this.postgresqlService.query(query, [email]);
    return result.length > 0 ? UserEntity.fromJson(result[0]) : null;
  }

  /**
   * Fetch a user by id.
   * @param id - The user's id.
   * @returns The user as an entity, or null if not found.
   */
  async getUserById(id: string): Promise<UserEntity | null> {
    const query = `
        SELECT * 
        FROM api.users
        WHERE id = $1
        LIMIT 1
      `;
    const result = await this.postgresqlService.query(query, [id]);
    return result.length > 0 ? UserEntity.fromJson(result[0]) : null;
  }
}
