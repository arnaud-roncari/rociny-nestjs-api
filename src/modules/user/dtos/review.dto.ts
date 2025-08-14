import { ReviewEntity } from '../entities/review.entity';

export class ReviewDto {
  id: number;
  collaboration_id: number;
  author_id: number;
  reviewed_id: number;
  stars: number;
  description?: string | null;
  created_at: string;

  static fromEntity(e: ReviewEntity): ReviewDto {
    return {
      id: e.id,
      collaboration_id: e.collaboration_id,
      author_id: e.author_id,
      reviewed_id: e.reviewed_id,
      stars: e.stars,
      description: e.description,
      created_at: e.created_at.toISOString(),
    };
  }
  static fromEntities(entities: ReviewEntity[]): ReviewDto[] {
    return entities.map(ReviewDto.fromEntity);
  }
}
