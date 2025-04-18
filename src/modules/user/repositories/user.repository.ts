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

  /**
   * Create a new user.
   * @param email - The user's email.
   * @param passwordHash - The hashed password of the user.
   * @param accountType - The account type of the user.
   * @returns The created user as an entity.
   */
  async createUser(
    email: string,
    passwordHash: string,
    accountType: string,
  ): Promise<UserEntity> {
    const query = `
      INSERT INTO api.users (email, password_hash, account_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [email, passwordHash, accountType];
    const result = await this.postgresqlService.query(query, values);
    return UserEntity.fromJson(result[0]);
  }

  /**
   * Update the password hash of a user by email.
   * @param email - The user's email.
   * @param newPasswordHash - The new hashed password.
   * @returns The updated user as an entity, or null if not found.
   */
  async updatePasswordByEmail(
    email: string,
    newPasswordHash: string,
  ): Promise<void> {
    const query = `
      UPDATE api.users
      SET password_hash = $1
      WHERE email = $2
    `;
    const values = [newPasswordHash, email];
    await this.postgresqlService.query(query, values);
  }
}
