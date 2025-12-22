import { CollaboratedCompanyEntity } from '../entities/collaborated_company_entity';

export class CollaboratedCompanyDto {
  user_id: number;
  name: string;
  profile_picture: string | null;

  constructor(data: CollaboratedCompanyDto) {
    Object.assign(this, data);
  }

  static fromEntity(entity: CollaboratedCompanyEntity): CollaboratedCompanyDto {
    return new CollaboratedCompanyDto({
      user_id: entity.userId,
      name: entity.name,
      profile_picture: entity.profilePicture,
    });
  }

  static fromEntities(
    entities: CollaboratedCompanyEntity[],
  ): CollaboratedCompanyDto[] {
    return (entities || []).map(CollaboratedCompanyDto.fromEntity);
  }
}
