export class InfluencerProfileCompletionStatusEntity {
  hasProfilePicture: boolean;
  hasPortfolio: boolean;
  hasName: boolean;
  hasDescription: boolean;
  hasDepartment: boolean;
  hasSocialNetworks: boolean;
  hasLegalDocuments: boolean;
  hasThemes: boolean;
  hasTargetAudience: boolean;
  hasStripeCompleted: boolean;
  hasInstagramAccount: boolean;
  hasSiret: boolean;

  constructor(parameters: InfluencerProfileCompletionStatusEntity) {
    Object.assign(this, parameters);
  }
}
