export class CompanyProfileCompletionStatusEntity {
  hasProfilePicture: boolean;
  hasName: boolean;
  hasDescription: boolean;
  hasDepartment: boolean;
  hasSocialNetworks: boolean;
  hasLegalDocuments: boolean;
  hasStripePaymentMethod: boolean;
  hasInstagramAccount: boolean;
  hasBillingAddress: boolean;
  hasTradeName: boolean;
  hasRepresentative: boolean;
  hasSiret: boolean;

  constructor(parameters: CompanyProfileCompletionStatusEntity) {
    Object.assign(this, parameters);
  }
}
