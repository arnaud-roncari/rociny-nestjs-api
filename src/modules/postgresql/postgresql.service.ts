import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class PostgresqlService implements OnModuleInit, OnModuleDestroy {
  private static client: Client;
  async onModuleInit() {
    if (!PostgresqlService.client) {
      PostgresqlService.client = new Client({
        host: 'rociny-postgres', // The name of "the container" in the docker-compose.yml file.
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
      });
      await PostgresqlService.client.connect();
    }
  }

  async onModuleDestroy() {
    if (PostgresqlService.client) {
      await PostgresqlService.client.end();
    }
  }

  async query(queryText: string, params: any[] = []): Promise<any[]> {
    const res = await PostgresqlService.client.query(queryText, params);
    return res.rows;
  }

  getClient(): Client {
    return PostgresqlService.client;
  }
}
