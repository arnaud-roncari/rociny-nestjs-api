import { Injectable } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { ConversationSummaryEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';
import { ConversationGateway } from './conversation.gateway';
import { CompanyRepository } from '../user/repositories/company.repository';
import { InfluencerRepository } from '../user/repositories/influencer.repository';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationGateway: ConversationGateway,
    private readonly companyRepository: CompanyRepository,
    private readonly influencerRepository: InfluencerRepository,
  ) {}

  async createConversation(
    influencerId: number,
    companyId: number,
    collaborationId: number,
  ): Promise<void> {
    let newConversation = await this.conversationRepository.createConversation(
      influencerId,
      companyId,
    );
    await this.conversationRepository.addMessage(
      newConversation.id,
      'company',
      companyId,
      null,
      collaborationId,
    );

    let conversation = await this.conversationRepository.getConversationById(
      newConversation.id,
    );

    const influencer = await this.influencerRepository.getInfluencerById(
      conversation.influencerId,
    );
    const company = await this.companyRepository.getCompanyById(
      conversation.companyId,
    );
    this.conversationGateway.refreshConversation(
      influencer.userId,
      conversation,
    );
    this.conversationGateway.refreshConversation(company.userId, conversation);
  }

  async conversationExists(
    influencerId: number,
    companyId: number,
  ): Promise<ConversationSummaryEntity | null> {
    let r = await this.conversationRepository.conversationExists(
      influencerId,
      companyId,
    );
    return r;
  }

  async getConversations(id: number): Promise<ConversationSummaryEntity[]> {
    let r =
      await this.conversationRepository.getConversationsByParticipantId(id);
    return r;
  }

  async getMessagesByConversationId(
    conversationId: number,
  ): Promise<MessageEntity[]> {
    let r =
      await this.conversationRepository.getMessagesByConversationId(
        conversationId,
      );
    return r;
  }

  async getConversationById(
    conversationId: number,
  ): Promise<ConversationSummaryEntity> {
    let r =
      await this.conversationRepository.getConversationById(conversationId);
    return r;
  }

  async markConversationMessagesAsRead(
    conversationId: number,
    currentSenderType: 'influencer' | 'company',
  ): Promise<void> {
    let conversation =
      await this.conversationRepository.markConversationMessagesAsRead(
        conversationId,
        currentSenderType,
      );

    const influencer = await this.influencerRepository.getInfluencerById(
      conversation.influencerId,
    );
    const company = await this.companyRepository.getCompanyById(
      conversation.companyId,
    );
    this.conversationGateway.refreshConversation(
      influencer.userId,
      conversation,
    );
    this.conversationGateway.refreshConversation(company.userId, conversation);
  }

  async addMessage(
    conversationId: number,
    senderType: 'influencer' | 'company',
    senderId: number,
    content: string | null,
    collaborationId?: number,
  ): Promise<MessageEntity> {
    let message = await this.conversationRepository.addMessage(
      conversationId,
      senderType,
      senderId,
      content,
      collaborationId,
    );

    const conversation = await this.getConversationById(conversationId);

    // Get both participants
    const influencer = await this.influencerRepository.getInfluencerById(
      conversation.influencerId,
    );
    const company = await this.companyRepository.getCompanyById(
      conversation.companyId,
    );

    //  Notify both (message + refresh conversation)
    this.conversationGateway.addMessage(influencer.userId, message);
    this.conversationGateway.addMessage(company.userId, message);

    this.conversationGateway.refreshConversation(
      influencer.userId,
      conversation,
    );
    this.conversationGateway.refreshConversation(company.userId, conversation);

    return message;
  }
}
