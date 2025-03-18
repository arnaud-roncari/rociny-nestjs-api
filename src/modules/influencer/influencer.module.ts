import { Module } from '@nestjs/common';
import { PostgresqlService } from '../postgresql/postgresql.service';
import { MinioService } from '../minio/minio.service';
import { InfluencerRepository } from './repositories/influencer.repository';
import { InfluencerAuthService } from './services/influencer.auth.service';
import { InfluencerAuthController } from './controllers/influencer.auth.controller';

@Module({
  providers: [
    PostgresqlService,
    MinioService,
    InfluencerRepository,
    InfluencerAuthService,
  ],
  controllers: [InfluencerAuthController],
})
export class InfluencerModule {}
