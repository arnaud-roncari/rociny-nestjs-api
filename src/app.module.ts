import { Module } from '@nestjs/common';
import { PostgresqlService } from './modules/postgresql/postgresql.service';
import { CrashModule } from './modules/crash/dtos/crash.module';
import { JwtModule } from '@nestjs/jwt';
import { InfluencerModule } from './modules/influencer/influencer.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    CrashModule,
    InfluencerModule,
  ],
  controllers: [],
  providers: [PostgresqlService],
})
export class AppModule {}
