import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { PostContentType } from '../enums/post-content-type.enum';

export class PostStats {
  @ApiProperty()
  @IsInt()
  accountsReached: number;

  @ApiProperty()
  @IsInt()
  likes: number;

  @ApiProperty()
  @IsInt()
  comments: number;

  @ApiProperty()
  @IsInt()
  saves: number;

  @ApiProperty()
  @IsInt()
  interactingAccounts: number;

  @ApiProperty()
  @IsInt()
  views: number;

  @ApiProperty()
  @IsInt()
  newFollowers: number;

  @ApiProperty()
  @IsInt()
  profileVisits: number;

  @IsEnum(PostContentType)
  @ApiProperty({ enum: PostContentType })
  contentType: PostContentType;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  date: Date;
}
