import { Module } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import { PolicyController } from './policy.controller';

@Module({
  providers: [MinioService],
  controllers: [PolicyController],
})
export class PolicyModule {}
