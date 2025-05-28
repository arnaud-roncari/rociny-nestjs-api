import { IsEnum, IsString, IsDateString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ContentType {
  STORY = 'STORY',
  REEL = 'REEL', 
  POST = 'POST',
  CONTEST = 'CONTEST'
}

export enum UsageRights {
  STANDARD = 'standard',
  EXTENDED = 'extended', 
  UNLIMITED = 'unlimited'
}

export enum ExclusivityLevel {
  NONE = 'none',
  CATEGORY = 'category',
  INDUSTRY = 'industry'
}

export class CollaborationRequestDto {
  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty()
  @IsString()
  nicheCategory: string;

  @ApiProperty()
  @IsString()
  destination: string;

  @ApiProperty()
  @IsDateString()
  publishDate: string;

  @ApiProperty({ default: 0.7 })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  cmpWeight?: number = 0.7; // Correction: cmpWeight et non cpmWeight

  @ApiProperty({ default: 0.3 })
  @IsNumber()
  @Min(0)
  @Max(1) 
  @IsOptional()
  cpaWeight?: number = 0.3;

  @ApiProperty({ enum: UsageRights, default: UsageRights.STANDARD })
  @IsEnum(UsageRights)
  @IsOptional()
  usageRights?: UsageRights = UsageRights.STANDARD;

  @ApiProperty({ enum: ExclusivityLevel, default: ExclusivityLevel.NONE })
  @IsEnum(ExclusivityLevel)
  @IsOptional()
  exclusivity?: ExclusivityLevel = ExclusivityLevel.NONE;
}