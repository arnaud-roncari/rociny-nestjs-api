import { Module } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { FacebookController } from './facebook.controller';
import { FacebookRepository } from './facebook.repository';
import { PostgresqlService } from '../postgresql/postgresql.service';
import { UserRepository } from '../user/repositories/user.repository';

@Module({
  providers: [
    FacebookService,
    FacebookRepository,
    PostgresqlService,
    UserRepository,
  ],
  controllers: [FacebookController],
})
export class FacebookModule {}
