import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../../postgresql/postgresql.service';
import { InstagramDemographicsEntity } from '../entities/instagram-demographic.entity';

@Injectable()
export class InstagramDemographicsRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  async bulkSave(data: InstagramDemographicsEntity[]): Promise<void> {
  const query = `
    INSERT INTO api.instagram_demographics (
      instagram_account_id, type, label, value, created_at
    ) VALUES
    ${data.map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`).join(',')}
  `;
  const values = data.flatMap(d => [
    d.instagram_account_id,
    d.type,
    d.label,
    d.value,
    d.created_at,
  ]);

  await this.postgresqlService.query(query, values);
  console.log('[INFO] Demographics inserted:', data.length);
}

}
