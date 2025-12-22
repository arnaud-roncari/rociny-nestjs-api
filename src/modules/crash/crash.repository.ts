import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../postgresql/postgresql.service';

@Injectable()
export class CrashRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}
  /**
   * Create a crash.
   * @param exception - The exception message.
   * @param stack - The stack trace.
   */
  async createCrash(exception: string, stack: string): Promise<void> {
    const query = `
    INSERT INTO api.crashes (exception, stack)
    VALUES ($1, $2)
    `;
    await this.postgresqlService.query(query, [exception, stack]);
  }
}
