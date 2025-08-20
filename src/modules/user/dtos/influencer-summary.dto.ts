import { ApiProperty } from '@nestjs/swagger';
import { InfluencerSummary } from '../entities/influencer_summary.entity';

export class InfluencerSummaryDto {
  @ApiProperty({ example: 42 })
  id: number;

  @ApiProperty({ example: 101 })
  user_id: number;

  @ApiProperty({ example: 'https://cdn.app.com/profiles/abc.jpg' })
  profile_picture: string;

  @ApiProperty({ example: ['https://cdn.app.com/portfolio/1.jpg'] })
  portfolio: string[];

  @ApiProperty({ example: 'Alice Dupont' })
  name: string;

  @ApiProperty({ example: 12000 })
  followers: number;

  @ApiProperty({ example: 5 })
  collaboration_amount: number;

  @ApiProperty({ example: 4.2 })
  average_stars: number;

  constructor(partial: Partial<InfluencerSummaryDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(entity: InfluencerSummary): InfluencerSummaryDto {
    return new InfluencerSummaryDto({
      id: entity.id,
      user_id: entity.userId,
      profile_picture: entity.profilePicture,
      portfolio: entity.portfolio,
      name: entity.name,
      followers: entity.followers,
      collaboration_amount: entity.collaborationAmount,
      average_stars: entity.averageStars,
    });
  }

  static fromEntities(entities: InfluencerSummary[]): InfluencerSummaryDto[] {
    return (entities || []).map((entity) =>
      InfluencerSummaryDto.fromEntity(entity),
    );
  }
}
