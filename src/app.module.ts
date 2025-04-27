import { Module } from '@nestjs/common';
import { PostgresqlService } from './modules/postgresql/postgresql.service';
import { CrashModule } from './modules/crash/dtos/crash.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/user/user.module';
import { PolicyModule } from './modules/policy/policy.module';
import { StripeService } from './modules/stripe/stripe.service';
import { MinioService } from './modules/minio/minio.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    CrashModule,
    UserModule,
    PolicyModule,
  ],
  controllers: [],
  providers: [PostgresqlService, StripeService, MinioService],
})
export class AppModule {}
