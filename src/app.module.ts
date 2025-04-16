import { Module } from '@nestjs/common';
import { PostgresqlService } from './modules/postgresql/postgresql.service';
import { CrashModule } from './modules/crash/dtos/crash.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/user/user.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    CrashModule,
    UserModule,
    MailModule,
  ],
  controllers: [],
  providers: [PostgresqlService],
})
export class AppModule {}
