import { Module } from '@nestjs/common';
import { PostgresqlService } from '../postgresql/postgresql.service';
import { MinioService } from '../minio/minio.service';
import { UserRepository } from './repositories/user.repository';
import { UserAuthService } from './services/user.auth.service';
import { UserAuthController } from './controllers/user.auth.controller';
import { InfluencerService } from './services/inlfuencer.service';
import { InfluencerController } from './controllers/influencer.controller';
import { InfluencerRepository } from './repositories/influencer.repository';
import { CompanyRepository } from './repositories/company.repository';
import { StripeService } from '../stripe/stripe.service';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { EmailService } from '../email/email.service';

@Module({
  providers: [
    PostgresqlService,
    InfluencerRepository,
    CompanyRepository,
    MinioService,
    UserRepository,
    UserAuthService,
    InfluencerService,
    StripeService,
    CompanyRepository,
    CompanyService,
    EmailService,
  ],
  controllers: [UserAuthController, InfluencerController, CompanyController],
})
export class UserModule {}
