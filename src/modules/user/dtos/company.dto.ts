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
  readonly created_at: Date;
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
      department: company.department,
      description: company.description,
      created_at: company.createdAt,
      social_networks: SocialNetworkDto.fromEntities(socialNetworks),
    });
  }
}
