import { CollaborationSummaryEntity } from '../entities/collaboration_summary.entity';

export class CollaborationSummaryDto {
  influencer_user_id: string;
  company_user_id: string;
  influencer_name: string;
  influencer_profile_picture: string | null;
  company_name: string;
  company_profile_picture: string | null;
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
      influencer_user_id: entity.influencerUserId,
      company_user_id: entity.companyUserId,
      influencer_name: entity.influencerName,
      influencer_profile_picture: entity.influencerProfilePicture,
      company_name: entity.companyName,
      company_profile_picture: entity.companyProfilePicture,
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
