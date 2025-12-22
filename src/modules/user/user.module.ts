import { Module } from '@nestjs/common';
import { PostgresqlService } from '../postgresql/postgresql.service';
import { MinioService } from '../minio/minio.service';
import { UserRepository } from './repositories/user.repository';
import { UserAuthService } from './services/user.auth.service';
import { UserAuthController } from './controllers/user.auth.controller';
import { InfluencerService } from './services/influencer.service';
import { InfluencerController } from './controllers/influencer.controller';
import { InfluencerRepository } from './repositories/influencer.repository';
import { CompanyRepository } from './repositories/company.repository';
import { StripeService } from '../stripe/stripe.service';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { EmailService } from '../email/email.service';
import { FacebookRepository } from '../facebook/facebook.repository';
import { FacebookService } from '../facebook/facebook.service';
import { CollaborationRepository } from './repositories/collaboration.repository';
import { CollaborationService } from './services/collaboration.service';
import { PriceAlgorithmService } from '../price_algorithm/price_algorithm.service';
import { ConversationRepository } from '../conversation/conversation.repository';
import { ConversationService } from '../conversation/conversation.service';
import { ConversationGateway } from '../conversation/conversation.gateway';
import { NotificationRepository } from '../notification/notification.repository';
import { NotificationService } from '../notification/notification.service';
import { PDFKitService } from './services/pdfkit.service';

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
    FacebookRepository,
    FacebookService,
    CollaborationRepository,
    CollaborationService,
    PriceAlgorithmService,
    ConversationRepository,
    ConversationService,
    ConversationGateway,
    NotificationRepository,
    NotificationService,
    PDFKitService,
  ],
  controllers: [UserAuthController, InfluencerController, CompanyController],
})
export class UserModule {}
