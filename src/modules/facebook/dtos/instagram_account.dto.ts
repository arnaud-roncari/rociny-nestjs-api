import { InstagramAccountEntity } from './instagram_account.entity';

export class InstagramAccountDto {
  readonly id: string;
  readonly name: string;
  readonly user_id: string;
  readonly instagram_id: string;
  readonly username: string;
  readonly profile_picture_url?: string | null;
  readonly followers_count?: number | null;

  constructor(parameters: InstagramAccountDto) {
    Object.assign(this, parameters);
  }

  static fromEntity(entity: InstagramAccountEntity): InstagramAccountDto {
    return new InstagramAccountDto({
      id: entity.id,
      user_id: entity.userId,
      instagram_id: entity.instagramId,
      name: entity.name,
      username: entity.username,
      profile_picture_url: entity.profilePictureUrl || null,
      followers_count: entity.followersCount || null,
    });
  }

  static fromEntities(
    entities: InstagramAccountEntity[],
  ): InstagramAccountDto[] {
    return entities.map((entity) => InstagramAccountDto.fromEntity(entity));
  }
}
