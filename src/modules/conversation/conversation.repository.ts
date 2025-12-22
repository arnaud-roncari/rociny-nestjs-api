import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../postgresql/postgresql.service';
import { ConversationSummaryEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class ConversationRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  async createConversation(
    influencerId: number,
    companyId: number,
  ): Promise<ConversationSummaryEntity> {
    const query = `
    INSERT INTO api.conversations (influencer_id, company_id)
    VALUES ($1, $2)
    RETURNING id, influencer_id, company_id, created_at, updated_at
  `;

    const rows = await this.postgresqlService.query(query, [
      influencerId,
      companyId,
    ]);

    return ConversationSummaryEntity.fromJson(rows[0]);
  }

  async getConversationsByParticipantId(
    id: number,
  ): Promise<ConversationSummaryEntity[]> {
    const query = `
    SELECT
      conv.id,
      conv.influencer_id,
      conv.company_id,
      conv.created_at,
      conv.updated_at,
      -- Last message
      (
        SELECT m.content
        FROM api.messages m
        WHERE m.conversation_id = conv.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message,
      -- Unread counts separated
      (
        SELECT COUNT(*) FROM api.messages m
        WHERE m.conversation_id = conv.id
        AND m.sender_type = 'company'
        AND m.is_read = false
      ) AS company_unread_message_count,
      (
        SELECT COUNT(*) FROM api.messages m
        WHERE m.conversation_id = conv.id
        AND m.sender_type = 'influencer'
        AND m.is_read = false
      ) AS influencer_unread_message_count,
      -- Full company / influencer info
      co.name  AS company_name,
      co.profile_picture AS company_profile_picture,
      i.name   AS influencer_name,
      i.profile_picture AS influencer_profile_picture
    FROM api.conversations conv
    JOIN api.companies co ON co.id = conv.company_id
    JOIN api.influencers i ON i.id = conv.influencer_id
    WHERE conv.influencer_id = $1 OR conv.company_id = $1
    ORDER BY conv.updated_at DESC
  `;

    const rows = await this.postgresqlService.query(query, [id]);
    return ConversationSummaryEntity.fromJsons(rows);
  }

  async getMessagesByConversationId(
    conversationId: number,
  ): Promise<MessageEntity[]> {
    const query = `
    SELECT
      m.id,
      m.conversation_id,
      m.sender_type,
      m.sender_id,
      m.content,
      m.is_read,
      m.created_at,
      m.collaboration_id,
      i.name               AS influencer_name,
      i.user_id            AS influencer_user_id,
      i.profile_picture    AS influencer_profile_picture,
      c.title              AS collaboration_title,
      COALESCE(SUM(pp.price), 0)    AS collaboration_price, 
      c.status             AS collaboration_status,
      c.id                 AS collaboration_id,
      COALESCE(SUM(pp.quantity), 0) AS placements_count,
      co.name              AS company_name,
      co.profile_picture   AS company_profile_picture,
      co.user_id           AS company_user_id
    FROM api.messages m
    LEFT JOIN api.collaborations c 
      ON m.collaboration_id = c.id
    LEFT JOIN api.influencers i 
      ON i.id = c.influencer_id
    LEFT JOIN api.companies co 
      ON co.id = c.company_id
    LEFT JOIN api.product_placements pp 
      ON pp.collaboration_id = c.id
    WHERE m.conversation_id = $1
    GROUP BY 
      m.id, m.conversation_id, m.sender_type, m.sender_id, m.content, m.is_read, m.created_at, m.collaboration_id,
      i.name, i.user_id, i.profile_picture, 
      c.title, c.status, c.id,
      co.name, co.profile_picture, co.user_id
    ORDER BY m.created_at ASC
  `;

    const rows = await this.postgresqlService.query(query, [conversationId]);
    return MessageEntity.fromJsons(rows);
  }

  async markConversationMessagesAsRead(
    conversationId: number,
    currentSenderType: 'influencer' | 'company',
  ): Promise<void> {
    // Mark all unread messages from the opposite sender as read
    const updateQuery = `
    UPDATE api.messages
    SET is_read = TRUE
    WHERE conversation_id = $1
      AND sender_type != $2
      AND is_read = FALSE
  `;
    await this.postgresqlService.query(updateQuery, [
      conversationId,
      currentSenderType,
    ]);
  }

  async addMessage(
    conversationId: number,
    senderType: 'influencer' | 'company',
    senderId: number,
    content: string | null,
    collaborationId?: number,
  ): Promise<MessageEntity> {
    const query = `
    INSERT INTO api.messages (
      conversation_id,
      sender_type,
      sender_id,
      content,
      collaboration_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      conversation_id,
      sender_type,
      sender_id,
      content,
      is_read,
      created_at,
      collaboration_id
  `;

    const rows = await this.postgresqlService.query(query, [
      conversationId,
      senderType,
      senderId,
      content,
      collaborationId ?? null,
    ]);

    await this.postgresqlService.query(
      `UPDATE api.conversations SET updated_at = now() WHERE id = $1`,
      [conversationId],
    );

    return MessageEntity.fromJson(rows[0]);
  }

  async getConversationById(
    conversationId: number,
  ): Promise<ConversationSummaryEntity | null> {
    const query = `
    SELECT
      conv.id,
      conv.influencer_id,
      conv.company_id,
      conv.created_at,
      conv.updated_at,
      -- Last message
      (
        SELECT m.content
        FROM api.messages m
        WHERE m.conversation_id = conv.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message,
      -- Unread counts separated
      (
        SELECT COUNT(*) FROM api.messages m
        WHERE m.conversation_id = conv.id
        AND m.sender_type = 'company'
        AND m.is_read = false
      ) AS company_unread_message_count,
      (
        SELECT COUNT(*) FROM api.messages m
        WHERE m.conversation_id = conv.id
        AND m.sender_type = 'influencer'
        AND m.is_read = false
      ) AS influencer_unread_message_count,
      -- Full company / influencer info
      co.name  AS company_name,
      co.profile_picture AS company_profile_picture,
      i.name   AS influencer_name,
      i.profile_picture AS influencer_profile_picture
    FROM api.conversations conv
    JOIN api.companies co ON co.id = conv.company_id
    JOIN api.influencers i ON i.id = conv.influencer_id
    WHERE conv.id = $1
    LIMIT 1
  `;

    const rows = await this.postgresqlService.query(query, [conversationId]);
    if (!rows || rows.length === 0) {
      return null;
    }
    return ConversationSummaryEntity.fromJson(rows[0]);
  }

  async conversationExists(
    influencerId: number,
    companyId: number,
  ): Promise<ConversationSummaryEntity | null> {
    const query = `
    SELECT
      conv.id,
      conv.influencer_id,
      conv.company_id,
      conv.created_at,
      conv.updated_at,
      -- Last message
      (
        SELECT m.content
        FROM api.messages m
        WHERE m.conversation_id = conv.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message,
      -- Unread counts separated
      (
        SELECT COUNT(*) FROM api.messages m
        WHERE m.conversation_id = conv.id
        AND m.sender_type = 'company'
        AND m.is_read = false
      ) AS company_unread_message_count,
      (
        SELECT COUNT(*) FROM api.messages m
        WHERE m.conversation_id = conv.id
        AND m.sender_type = 'influencer'
        AND m.is_read = false
      ) AS influencer_unread_message_count,
      -- Full company / influencer info
      co.name  AS company_name,
      co.profile_picture AS company_profile_picture,
      i.name   AS influencer_name,
      i.profile_picture AS influencer_profile_picture
    FROM api.conversations conv
    JOIN api.companies co ON co.id = conv.company_id
    JOIN api.influencers i ON i.id = conv.influencer_id
    WHERE conv.influencer_id = $1 AND conv.company_id = $2
    LIMIT 1
  `;

    const rows = await this.postgresqlService.query(query, [
      influencerId,
      companyId,
    ]);
    if (!rows || rows.length === 0) {
      return null;
    }
    return ConversationSummaryEntity.fromJson(rows[0]);
  }
}
