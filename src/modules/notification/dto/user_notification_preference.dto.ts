import { UserNotificationPreferenceEntity } from '../entities/user_notification_preference.entity';

export class UserNotificationPreferenceDto {
  type: string;
  enabled: boolean;

  constructor(data: UserNotificationPreferenceDto) {
    Object.assign(this, data);
  }

  static fromEntity(
    entity: UserNotificationPreferenceEntity,
  ): UserNotificationPreferenceDto {
    return new UserNotificationPreferenceDto({
      type: entity.type,
      enabled: entity.enabled,
    });
  }

  static fromEntities(
    entities: UserNotificationPreferenceEntity[],
  ): UserNotificationPreferenceDto[] {
    return (entities || []).map(UserNotificationPreferenceDto.fromEntity);
  }
}
