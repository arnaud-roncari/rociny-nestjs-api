import { Module } from '@nestjs/common';
import { CrashRepository } from '../crash.repository';
import { CrashService } from '../crash.service';
import { PostgresqlService } from 'src/modules/postgresql/postgresql.service';
import { CrashController } from '../crash.controller';

@Module({
  providers: [CrashRepository, CrashService, PostgresqlService],
  controllers: [CrashController],
})
export class CrashModule {}
