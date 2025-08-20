import { CompanyEntity } from '../entities/company.entity';
import { SocialNetworkEntity } from '../entities/social_network.entity';
import { SocialNetworkDto } from './social-network.dto';

export class CompanyDto {
  readonly id: number;
  readonly user_id: number;
  readonly profile_picture: string | null;
  readonly name: string | null;
  readonly department: string | null;
  readonly description: string | null;
  readonly trade_name: string | null;
  readonly city: string | null;
  readonly street: string | null;
  readonly postal_code: string | null;
  readonly vat_number: string | null;
  readonly created_at: Date;
  readonly stripe_customer_id: string;

  readonly collaboration_amount: number;
  readonly average_stars: number;

  readonly social_networks: SocialNetworkDto[];

  constructor(parameters: CompanyDto) {
    Object.assign(this, parameters);
  }

  static fromEntity(
    company: CompanyEntity,
    socialNetworks: SocialNetworkEntity[],
  ): CompanyDto {
    return new CompanyDto({
      id: company.id,
      user_id: company.userId,
      profile_picture: company.profilePicture,
      name: company.name,
      city: company.city,
      street: company.street,
      trade_name: company.tradeName,
      postal_code: company.postalCode,
      vat_number: company.vatNumber,
      department: company.department,
      description: company.description,
      created_at: company.createdAt,
      stripe_customer_id: company.stripeCustomerId,
      collaboration_amount: company.collaborationAmount,
      average_stars: company.averageStars,
      social_networks: SocialNetworkDto.fromEntities(socialNetworks),
    });
  }
}
