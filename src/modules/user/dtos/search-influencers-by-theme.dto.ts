import { IsOptional, IsString } from 'class-validator';

export class SearchInfluencersByThemeDto {
  @IsString()
  @IsOptional()
  theme?: string | null;
}
