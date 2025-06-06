import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { UserEntity } from '../entities/user.entity';
import { OAuthUserEntity } from '../entities/oauth_user.entity';
import { AccountType } from 'src/commons/enums/account_type';

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
   * Update the account type of a user.
   * @param userId - The ID of the user to update.
   * @param accountType - The new account type to assign (e.g., influencer or company).
   */
  async updateUserAccountType(
    userId: number,
    accountType: AccountType,
  ): Promise<void> {
    const query = `
    UPDATE api.users
    SET account_type = $1
    WHERE id = $2
  `;
    await this.postgresqlService.query(query, [accountType, userId]);
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
    passwordHash: string | null,
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

  /**
   * Delete a user from the database by their user ID.
   *
   * @param userId - The unique identifier of the user to delete.
   * @returns A Promise that resolves when the user has been deleted.
   */
  async deleteUserById(userId: string): Promise<void> {
    const query = `
    DELETE FROM api.users
    WHERE id = $1
  `;
    const values = [userId];
    await this.postgresqlService.query(query, values);
  }

  /**
   * Retrieves an OAuth user based on the provider and provider user ID.
   *
   * This function performs an SQL query to fetch an OAuth user from the `oauth_users` table
   * based on the provider (e.g., Google, Apple) and the provider-specific user ID.
   *
   * @param provider The name of the OAuth provider (e.g., 'google', 'apple').
   * @param providerUserId The unique ID of the user on the provider (e.g., the Google or Apple user ID).
   * @returns A promise that resolves to the `OAuthUserEntity` corresponding to the provided provider and user ID,
   *          or throws an error if the user is not found.
   */
  async getOAuthUser(
    provider: string,
    providerUserId: string,
  ): Promise<OAuthUserEntity | null> {
    const query = `
    SELECT * 
    FROM api.oauth_users
    WHERE provider = $1 AND provider_user_id = $2
    LIMIT 1
  `;
    const values = [provider, providerUserId];
    const r = await this.postgresqlService.query(query, values);

    return OAuthUserEntity.fromJson(r[0]);
  }

  async getOAuthUserByUserId(
    provider: string,
    userId: string,
  ): Promise<OAuthUserEntity | null> {
    const query = `
      SELECT * 
      FROM api.oauth_users
      WHERE user_id = $1 AND provider = $2
      LIMIT 1
    `;
    const values = [userId, provider];
    const r = await this.postgresqlService.query(query, values);

    if (r.length === 0) return null;

    return OAuthUserEntity.fromJson(r[0]);
  }

  async getOAuthUserByProviderId(
    providerUserId: string,
  ): Promise<OAuthUserEntity | null> {
    const query = `
    SELECT * 
    FROM api.oauth_users
    WHERE provider_user_id = $1
    LIMIT 1
  `;
    const values = [providerUserId];
    const r = await this.postgresqlService.query(query, values);

    return OAuthUserEntity.fromJson(r[0]);
  }

  /**
   * Creates a new OAuth user in the database.
   *
   * This function inserts a new OAuth user into the `oauth_users` table with the provided
   * details (userId, provider, providerUserId).
   *
   * @param userId The ID of the user associated with this OAuth user (foreign key reference to the `users` table).
   * @param provider The name of the OAuth provider (e.g., 'google', 'apple').
   * @param providerUserId The unique ID of the user on the provider (e.g., the Google or Apple user ID).
   * @returns A promise that resolves to the `OAuthUserEntity` created with the generated ID after insertion.
   */
  async createOAuthUser(
    userId: number,
    provider: string,
    providerUserId: string | null,
    accessToken: string | null,
    tokenExpiration: Date | null,
  ): Promise<OAuthUserEntity> {
    const query = `
    INSERT INTO api.oauth_users (user_id, provider, provider_user_id, access_token, token_expiration)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
    const values = [
      userId,
      provider,
      providerUserId,
      accessToken,
      tokenExpiration,
    ];
    const r = await this.postgresqlService.query(query, values);

    return OAuthUserEntity.fromJson(r[0]);
  }

  async updateOAuthToken(
    userId: number,
    provider: string,
    accessToken: string,
    tokenExpiration: Date,
  ): Promise<void> {
    const query = `
      UPDATE api.oauth_users
      SET access_token = $1,
          token_expiration = $2
      WHERE user_id = $3 AND provider = $4
    `;

    const values = [accessToken, tokenExpiration, userId, provider];
    await this.postgresqlService.query(query, values);
  }

  /**
   * Update a user's password hash.
   * @param id - The user's id.
   * @param passwordHash - The new hashed password.
   */
  async updateUserPassword(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    const query = `
    UPDATE api.users
    SET password_hash = $1
    WHERE id = $2
  `;
    await this.postgresqlService.query(query, [passwordHash, userId]);
  }
  /**
   * Update a user's email.
   * @param id - The user's id.
   * @param email - The new email.
   */
  async updateUserEmail(userId: string, email: string): Promise<void> {
    const query = `
    UPDATE api.users
    SET email = $1
    WHERE id = $2
  `;
    await this.postgresqlService.query(query, [email, userId]);
  }

  /**
   * Delete an OAuth user record by its ID.
   * @param oauthId - The ID of the OAuth record.
   */
  async deleteOAuthUserById(oauthId: number): Promise<void> {
    const query = `
    DELETE FROM api.oauth_users
    WHERE id = $1
  `;

    await this.postgresqlService.query(query, [oauthId]);
  }
}
