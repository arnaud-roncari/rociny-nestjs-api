import { CollaborationSummaryDto } from 'src/modules/user/dtos/collaboration-summary.dto';
import { MessageEntity } from '../entities/message.entity';

export class MessageDto {
  id: number;
  conversation_id: number;
  sender_type: 'influencer' | 'company';
  sender_id: number;
  content: string | null;
  is_read: boolean;
  created_at: Date;
  collaboration: CollaborationSummaryDto | null;

  constructor(params: MessageDto) {
    Object.assign(this, params);
  }

  static fromEntity(entity: MessageEntity): MessageDto {
    return new MessageDto({
      id: entity.id,
      conversation_id: entity.conversationId,
      sender_type: entity.senderType,
      sender_id: entity.senderId,
      content: entity.content,
      is_read: entity.isRead,
      created_at: entity.createdAt,
      collaboration: entity.collaboration
        ? CollaborationSummaryDto.fromEntity(entity.collaboration)
        : null,
    });
  }

  static fromEntities(entities: MessageEntity[]): MessageDto[] {
    return (entities || []).map((e) => MessageDto.fromEntity(e));
  }
}
