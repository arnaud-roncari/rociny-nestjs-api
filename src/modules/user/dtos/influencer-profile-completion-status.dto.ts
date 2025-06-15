import { InfluencerProfileCompletionStatusEntity } from '../entities/influencer_profile_completion_status.entity';

export class InfluencerProfileCompletionStatusDto {
  readonly has_profile_picture: boolean;
  readonly has_portfolio: boolean;
  readonly has_name: boolean;
  readonly has_description: boolean;
  readonly has_department: boolean;
  readonly has_social_networks: boolean;
  readonly has_legal_documents: boolean;
  readonly has_themes: boolean;
  readonly has_target_audience: boolean;
  readonly has_stripe_completed: boolean;
  readonly has_instagram_account: boolean;

  constructor(parameters: InfluencerProfileCompletionStatusDto) {
    Object.assign(this, parameters);
  }

  static fromEntity(
    entity: InfluencerProfileCompletionStatusEntity,
  ): InfluencerProfileCompletionStatusDto {
    return new InfluencerProfileCompletionStatusDto({
      has_profile_picture: entity.hasProfilePicture,
      has_portfolio: entity.hasPortfolio,
      has_name: entity.hasName,
      has_description: entity.hasDescription,
      has_department: entity.hasDepartment,
      has_social_networks: entity.hasSocialNetworks,
      has_legal_documents: entity.hasLegalDocuments,
      has_themes: entity.hasThemes,
      has_target_audience: entity.hasTargetAudience,
      has_stripe_completed: entity.hasStripeCompleted,
      has_instagram_account: entity.hasInstagramAccount,
    });
  }
}
