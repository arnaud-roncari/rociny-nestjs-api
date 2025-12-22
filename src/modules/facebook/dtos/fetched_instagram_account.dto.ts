import { FetchedInstagramAccountEntity } from '../entities/fetched_instagram_account.entity';

export class FetchedInstagramAccountDto {
  readonly id: string;
  readonly name: string;
  readonly username: string;
  readonly profile_picture_url?: string | null;
  readonly followers_count?: number | null;

  constructor(parameters: FetchedInstagramAccountDto) {
    Object.assign(this, parameters);
  }

  static fromEntity(
    entity: FetchedInstagramAccountEntity,
  ): FetchedInstagramAccountDto {
    return new FetchedInstagramAccountDto({
      id: entity.id,
      name: entity.name,
      username: entity.username,
      profile_picture_url: entity.profilePictureUrl || null,
      followers_count: entity.followersCount || null,
    });
  }

  static fromEntities(
    entities: FetchedInstagramAccountEntity[],
  ): FetchedInstagramAccountDto[] {
    return entities.map((entity) =>
      FetchedInstagramAccountDto.fromEntity(entity),
    );
  }
}
