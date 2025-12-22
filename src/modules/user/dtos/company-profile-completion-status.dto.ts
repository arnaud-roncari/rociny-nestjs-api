import { CompanyProfileCompletionStatusEntity } from '../entities/company_profile_completion_status.entity';

export class CompanyProfileCompletionStatusDto {
  readonly has_profile_picture: boolean;
  readonly has_name: boolean;
  readonly has_description: boolean;
  readonly has_department: boolean;
  readonly has_social_networks: boolean;
  readonly has_legal_documents: boolean;
  readonly has_stripe_payment_method: boolean;
  readonly has_instagram_account: boolean;
  readonly has_trade_name: boolean;
  readonly has_billing_address: boolean;
  readonly has_representative: boolean;
  readonly has_siret: boolean;

  constructor(parameters: CompanyProfileCompletionStatusDto) {
    Object.assign(this, parameters);
  }
  static fromEntity(
    entity: CompanyProfileCompletionStatusEntity,
  ): CompanyProfileCompletionStatusDto {
    return new CompanyProfileCompletionStatusDto({
      has_profile_picture: entity.hasProfilePicture,
      has_name: entity.hasName,
      has_description: entity.hasDescription,
      has_department: entity.hasDepartment,
      has_social_networks: entity.hasSocialNetworks,
      has_legal_documents: entity.hasLegalDocuments,
      has_stripe_payment_method: entity.hasStripePaymentMethod,
      has_instagram_account: entity.hasInstagramAccount,
      has_billing_address: entity.hasBillingAddress,
      has_trade_name: entity.hasTradeName,
      has_representative: entity.hasRepresentative,
      has_siret: entity.hasSiret,
    });
  }
}
