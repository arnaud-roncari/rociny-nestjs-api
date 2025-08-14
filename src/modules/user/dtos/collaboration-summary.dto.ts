import { CollaborationSummaryEntity } from '../entities/collaboration_summary.entity';

export class CollaborationSummaryDto {
  influencer_name: string;
  user_id: string;
  influencer_profile_picture: string | null;
  collaboration_title: string;
  collaboration_price: number;
  collaboration_id: number;
  collaboration_status: string;
  placements_count: number;

  constructor(data: Partial<CollaborationSummaryDto>) {
    Object.assign(this, data);
  }

  static fromEntity(
    entity: CollaborationSummaryEntity,
  ): CollaborationSummaryDto {
    return new CollaborationSummaryDto({
      user_id: entity.userId,
      influencer_name: entity.influencerName,
      influencer_profile_picture: entity.influencerProfilePicture,
      collaboration_title: entity.collaborationTitle,
      collaboration_price: entity.collaborationPrice,
      collaboration_id: entity.collaborationId,
      collaboration_status: entity.collaborationStatus,
      placements_count: entity.placementsCount,
    });
  }

  static fromEntities(
    entities: CollaborationSummaryEntity[],
  ): CollaborationSummaryDto[] {
    return (entities || []).map(CollaborationSummaryDto.fromEntity);
  }
}
