import { CollaborationSummaryEntity } from 'src/modules/user/entities/collaboration_summary.entity';

export class MessageEntity {
  id: number;
  conversationId: number;
  senderType: 'influencer' | 'company';
  senderId: number;
  content: string | null;
  collaboration: CollaborationSummaryEntity | null;
  isRead: boolean;
  createdAt: Date;

  constructor(data: Partial<MessageEntity>) {
    Object.assign(this, data);
  }

  static fromJson(json: any): MessageEntity {
    return new MessageEntity({
      id: json.id,
      conversationId: json.conversation_id,
      senderType: json.sender_type,
      senderId: json.sender_id,
      content: json.content,
      isRead: json.is_read,
      createdAt: json.created_at,
      collaboration: json.collaboration_id
        ? CollaborationSummaryEntity.fromJson(json)
        : null,
    });
  }

  static fromJsons(jsons: any[]): MessageEntity[] {
    return (jsons || []).map(MessageEntity.fromJson);
  }
}
