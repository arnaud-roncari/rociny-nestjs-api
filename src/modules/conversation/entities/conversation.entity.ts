export class ConversationSummaryEntity {
  id: number;
  influencerId: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;

  // Computed / aggregated fields
  lastMessage: string | null;
  companyUnreadMessageCount: number;
  influencerUnreadMessageCount: number;

  // Explicit company / influencer info
  companyName: string;
  companyProfilePicture: string | null;
  influencerName: string;
  influencerProfilePicture: string | null;

  constructor(params: ConversationSummaryEntity) {
    this.id = params.id;
    this.influencerId = params.influencerId;
    this.companyId = params.companyId;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.lastMessage = params.lastMessage;
    this.companyUnreadMessageCount = params.companyUnreadMessageCount;
    this.influencerUnreadMessageCount = params.influencerUnreadMessageCount;
    this.companyName = params.companyName;
    this.companyProfilePicture = params.companyProfilePicture;
    this.influencerName = params.influencerName;
    this.influencerProfilePicture = params.influencerProfilePicture;
  }

  static fromJson(json: any): ConversationSummaryEntity {
    return new ConversationSummaryEntity({
      id: Number(json.id),
      influencerId: Number(json.influencer_id),
      companyId: Number(json.company_id),
      createdAt: new Date(json.created_at),
      updatedAt: new Date(json.updated_at),
      lastMessage: json.last_message ?? null,
      companyUnreadMessageCount: Number(json.company_unread_message_count) || 0,
      influencerUnreadMessageCount:
        Number(json.influencer_unread_message_count) || 0,
      companyName: json.company_name,
      companyProfilePicture: json.company_profile_picture ?? null,
      influencerName: json.influencer_name,
      influencerProfilePicture: json.influencer_profile_picture ?? null,
    });
  }

  static fromJsons(jsons: any[]): ConversationSummaryEntity[] {
    return (jsons || []).map((j) => ConversationSummaryEntity.fromJson(j));
  }
}
