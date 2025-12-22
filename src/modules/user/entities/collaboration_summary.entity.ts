export class CollaborationSummaryEntity {
  influencerUserId: string;
  companyUserId: string;
  influencerName: string;
  influencerProfilePicture: string | null;
  companyName: string;
  companyProfilePicture: string | null;
  collaborationTitle: string;
  collaborationPrice: number;
  collaborationId: number;
  collaborationStatus: string;
  placementsCount: number;

  constructor(params: CollaborationSummaryEntity) {
    Object.assign(this, params);
  }

  static fromJson(json: any): CollaborationSummaryEntity {
    return new CollaborationSummaryEntity({
      influencerUserId: json.influencer_user_id,
      companyUserId: json.company_user_id,
      influencerName: json.influencer_name,
      influencerProfilePicture: json.influencer_profile_picture ?? null,
      companyName: json.company_name,
      companyProfilePicture: json.company_profile_picture ?? null,
      collaborationTitle: json.collaboration_title,
      collaborationPrice: Number(json.collaboration_price) || 0,
      collaborationId: Number(json.collaboration_id) || 0,
      collaborationStatus: json.collaboration_status,
      placementsCount: Number(json.placements_count) || 0,
    });
  }

  static fromJsons(jsons: any[]): CollaborationSummaryEntity[] {
    return (jsons || []).map((j) => CollaborationSummaryEntity.fromJson(j));
  }
}
