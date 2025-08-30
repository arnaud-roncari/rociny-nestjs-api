// dtos/update_user_notification_preference.dto.ts
import { IsBoolean, IsEnum } from 'class-validator';
import { NotificationType } from '../constant';

export class UpdateUserNotificationPreferenceDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsBoolean()
  enabled: boolean;
}
