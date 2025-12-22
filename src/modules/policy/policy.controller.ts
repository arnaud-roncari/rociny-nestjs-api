import { Controller, Get, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MinioService } from '../minio/minio.service';
import { BucketType } from 'src/commons/enums/bucket_type';

@Controller('policy')
export class PolicyController {
  constructor(private readonly minioService: MinioService) {}

  @ApiOperation({})
  @ApiResponse({})
  @Get('privacy-policy')
  async getPrivacyPolicy(): Promise<StreamableFile> {
    const picture = await this.minioService.getFile(
      BucketType.policies,
      'privacy_policy.pdf',
    );
    return new StreamableFile(picture);
  }

  @ApiOperation({})
  @ApiResponse({})
  @Get('terms-of-use')
  async getTermsOfUse(): Promise<StreamableFile> {
    const picture = await this.minioService.getFile(
      BucketType.policies,
      'terms_of_use.pdf',
    );
    return new StreamableFile(picture);
  }
}
