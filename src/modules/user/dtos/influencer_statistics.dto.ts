import { ApiProperty } from '@nestjs/swagger';
import { InfluencerStatisticsEntity } from '../entities/influencer_statistics.entity';

export class InfluencerStatisticsDto {
  @ApiProperty({ example: 1200 })
  revenue: number;

  @ApiProperty({ example: 4.5 })
  average_rating: number;

  @ApiProperty({ example: 350 })
  profile_views: number;

  @ApiProperty({ example: 8 })
  collaborations_count: number;

  @ApiProperty({ example: 5 })
  placements_count: number;

  constructor(parameters: InfluencerStatisticsDto) {
    Object.assign(this, parameters);
  }

  static fromEntity(
    entity: InfluencerStatisticsEntity,
  ): InfluencerStatisticsDto {
    return new InfluencerStatisticsDto({
      revenue: entity.revenue,
      average_rating: entity.averageRating,
      profile_views: entity.profileViews,
      collaborations_count: entity.collaborationsCount,
      placements_count: entity.placementsCount,
    });
  }
}
