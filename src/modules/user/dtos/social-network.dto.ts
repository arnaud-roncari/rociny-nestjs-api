import { PlatformType } from 'src/commons/enums/platform_type';
import { SocialNetworkEntity } from '../entities/social_network.entity';

export class SocialNetworkDto {
  constructor(parameters: SocialNetworkDto) {
    Object.assign(this, parameters);
  }

  readonly id: string;
  readonly platform: PlatformType;
  readonly url: string;
  readonly created_at: Date;

  static fromEntity(entity: SocialNetworkEntity): SocialNetworkDto {
    return new SocialNetworkDto({
      id: entity.id,
      platform: entity.platform,
      url: entity.url,
      created_at: entity.createdAt,
    });
  }

  static fromEntities(entities: SocialNetworkEntity[]): SocialNetworkDto[] {
    return entities.map((entity) => SocialNetworkDto.fromEntity(entity));
  }
}
