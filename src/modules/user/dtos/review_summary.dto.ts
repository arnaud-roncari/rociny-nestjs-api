import { ReviewSummaryEntity } from '../entities/review_summary.entity';

export class ReviewSummaryDto {
  user_id: number;
  name: string;
  profile_picture: string | null;
  description: string;

  constructor(data: ReviewSummaryDto) {
    Object.assign(this, data);
  }

  static fromEntity(entity: ReviewSummaryEntity): ReviewSummaryDto {
    return new ReviewSummaryDto({
      user_id: entity.userId,
      name: entity.name,
      profile_picture: entity.profilePicture ?? null,
      description: entity.description,
    });
  }

  static fromEntities(entities: ReviewSummaryEntity[]): ReviewSummaryDto[] {
    return (entities || []).map(ReviewSummaryDto.fromEntity);
  }
}
