import { Module } from '@nestjs/common';
import { PostgresqlService } from '../postgresql/postgresql.service';
import { MinioService } from '../minio/minio.service';
import { UserRepository } from './repositories/user.repository';
import { UserAuthService } from './services/user.auth.service';
import { UserAuthController } from './controllers/user.auth.controller';

@Module({
  providers: [PostgresqlService, MinioService, UserRepository, UserAuthService],
  controllers: [UserAuthController],
})
export class UserModule {}
