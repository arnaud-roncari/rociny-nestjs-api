import { ContentType } from './collaboration-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';

export class CollaborationBriefDto {
  @ApiProperty({ type: [Number], example: [25, 54] })
  @IsArray()
  ageRange: [number, number];

  @ApiProperty({ enum: ['FEMALE', 'MALE', 'ALL'] })
  @IsString()
  targetGender: 'FEMALE' | 'MALE' | 'ALL';

  @ApiProperty({ example: 0.05 })
  @IsNumber()
  minEngagementRate: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  minReach: number;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  maxBudget: number;

  @ApiProperty({ enum: ['AWARENESS', 'ENGAGEMENT', 'SALES'] })
  @IsString()
  campaignGoal: 'AWARENESS' | 'ENGAGEMENT' | 'SALES';

  @ApiProperty({ example: 'skin care' })
  @IsString()
  nicheCategory: string;

  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ example: '2025-06-01' })
  @IsString()
  publishDate: string;

  @ApiProperty({ example: 'Instagram' })
  @IsString()
  destination: string;

  @ApiProperty({ enum: ['STANDARD', 'EXTENDED', 'UNLIMITED'] })
  @IsString()
  usageRights: 'STANDARD' | 'EXTENDED' | 'UNLIMITED';

  @ApiProperty({ enum: ['NONE', 'CATEGORY', 'INDUSTRY'] })
  @IsString()
  exclusivity: 'NONE' | 'CATEGORY' | 'INDUSTRY';
}
