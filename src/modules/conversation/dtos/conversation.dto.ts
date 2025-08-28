import { ConversationSummaryEntity } from '../entities/conversation.entity';

export class ConversationSummaryDto {
  id: number;
  influencer_id: number;
  company_id: number;
  created_at: Date;
  updated_at: Date;
  last_message: string | null;
  company_unread_message_count: number;
  influencer_unread_message_count: number;
  company_name: string;
  company_profile_picture: string | null;
  influencer_name: string;
  influencer_profile_picture: string | null;

  constructor(params: ConversationSummaryDto) {
    Object.assign(this, params);
  }

  static fromEntity(entity: ConversationSummaryEntity): ConversationSummaryDto {
    return new ConversationSummaryDto({
      id: entity.id,
      influencer_id: entity.influencerId,
      company_id: entity.companyId,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      last_message: entity.lastMessage,
      company_unread_message_count: entity.companyUnreadMessageCount,
      influencer_unread_message_count: entity.influencerUnreadMessageCount,
      company_name: entity.companyName,
      company_profile_picture: entity.companyProfilePicture,
      influencer_name: entity.influencerName,
      influencer_profile_picture: entity.influencerProfilePicture,
    });
  }

  static fromEntities(
    entities: ConversationSummaryEntity[],
  ): ConversationSummaryDto[] {
    return (entities || []).map((e) => ConversationSummaryDto.fromEntity(e));
  }
}
