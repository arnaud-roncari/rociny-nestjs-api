import { Module } from '@nestjs/common';
import { CollaborationPricingService  } from './services/collaboration-pricing.service';
import { CollaborationPricingController  } from './controllers/collaboration-pricing.controller';
import { InstagramInsightHistoryRepository } from './repositories/insightHistory.repository';
import { InstagramDemographicsRepository } from './repositories/demographics.repository';
import { InstagramRepository } from './repositories/instagram.repository';
import { InstagramService } from './services/instagramInsight.service';
import { HttpModule } from '@nestjs/axios';
import { PostgresqlService } from '../postgresql/postgresql.service';
import { InstagramController } from './controllers/instagram.controller';
import { InstagramMediaRepository } from './repositories/media.repository';
import { InfluencerRepositoryService } from './repositories/influencer.repository';

@Module({
  imports: [HttpModule],
  controllers: [CollaborationPricingController ,InstagramController],
  providers: [
    CollaborationPricingService ,
    PostgresqlService,
    InstagramRepository,
    InstagramInsightHistoryRepository,
    InstagramDemographicsRepository,
    InstagramService,
    InstagramMediaRepository,
    InfluencerRepositoryService,
  ],
  exports: [CollaborationPricingService],
})
export class CollaborationModule {}
