import { IsNumber, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from './collaboration-request.dto';

export class PostStatsDto {
  @ApiProperty()
  @IsNumber()
  accountsReached: number;

  @ApiProperty()
  @IsNumber()
  likes: number;

  @ApiProperty()
  @IsNumber()
  comments: number;

  @ApiProperty()
  @IsNumber()
  saves: number;

  @ApiProperty()
  @IsNumber()
  interactingAccounts?: number;

  @ApiProperty()
  @IsNumber()
  views: number;

  @ApiProperty()
  @IsNumber()
  newFollowers: number;

  @ApiProperty()
  @IsNumber()
  profileVisits: number;

  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty()
  @IsDateString()
  date: string;
}