import { CompanyEntity } from '../entities/company.entity';

export class CompanyDto {
  readonly id: number;
  readonly user_id: number;
  readonly profile_picture: string | null;
  readonly name: string | null;
  readonly department: string | null;
  readonly description: string | null;
  readonly created_at: Date;

  constructor(parameters: CompanyDto) {
    Object.assign(this, parameters);
  }

  static fromEntity(entity: CompanyEntity): CompanyDto {
    return new CompanyDto({
      id: entity.id,
      user_id: entity.userId,
      profile_picture: entity.profilePicture,
      name: entity.name,
      department: entity.department,
      description: entity.description,
      created_at: entity.createdAt,
    });
  }
}
