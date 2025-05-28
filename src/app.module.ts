import { Module } from '@nestjs/common';
import { PostgresqlService } from './modules/postgresql/postgresql.service';
import { CrashModule } from './modules/crash/dtos/crash.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/user/user.module';
import { PolicyModule } from './modules/policy/policy.module';
import { StripeService } from './modules/stripe/stripe.service';
import { MinioService } from './modules/minio/minio.service';
import { Email } from './modules/email/email.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    ScheduleModule.forRoot(),
    CrashModule,
    UserModule,
    Email,
    PolicyModule,
    CollaborationModule,
  ],
  controllers: [],
  providers: [PostgresqlService, StripeService, MinioService],
})
export class AppModule {}
