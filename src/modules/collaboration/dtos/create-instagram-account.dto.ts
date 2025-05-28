import { IsOptional, IsString, IsNumber, IsDate, IsBoolean } from 'class-validator';

export class CreateInstagramAccountDto {
  @IsString()
  instagram_id: string;

  @IsString()
  facebook_id: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsNumber()
  followers_count: number;

  @IsNumber()
  follows_count: number;

  @IsNumber()
  media_count: number;

  @IsOptional()
  @IsNumber()
  average_engagement_rate?: number;

  @IsOptional()
  @IsNumber()
  average_likes?: number;

  @IsOptional()
  @IsNumber()
  average_comments?: number;

  @IsOptional()
  @IsNumber()
  reach?: number;

  @IsOptional()
  @IsNumber()
  impressions?: number;

  @IsOptional()
  @IsNumber()
  profile_views?: number;

  @IsOptional()
  @IsNumber()
  website_clicks?: number;

  @IsOptional()
  @IsDate()
  insights_last_updated?: Date;

  @IsString()
  facebook_token: string;

  @IsString()
  page_access_token: string;

  @IsDate()
  user_token_last_refresh: Date;

  @IsDate()
  page_token_last_refresh: Date;

  @IsBoolean()
  needs_reconnect: Boolean;
}
