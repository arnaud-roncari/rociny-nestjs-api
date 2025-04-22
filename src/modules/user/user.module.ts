import { Module } from '@nestjs/common';
import { PostgresqlService } from '../postgresql/postgresql.service';
import { MinioService } from '../minio/minio.service';
import { UserRepository } from './repositories/user.repository';
import { UserAuthService } from './services/user.auth.service';
import { UserAuthController } from './controllers/user.auth.controller';
import { MailModule } from '../mail/mail.module';
import { InfluencerService } from './services/inlfuencer.service';
import { InfluencerController } from './controllers/influencer.controller';
import { InfluencerRepository } from './repositories/influencer.repository';
import { CompanyRepository } from './repositories/company.repository';


@Module({
  imports: [MailModule],
  providers: [
    PostgresqlService,
    InfluencerRepository,
    CompanyRepository,
    MinioService,
    UserRepository,
    UserAuthService,
    InfluencerService,
  ],
  controllers: [UserAuthController, InfluencerController],
})
export class UserModule {}
