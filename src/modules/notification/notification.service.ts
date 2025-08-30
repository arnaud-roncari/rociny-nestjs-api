import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { UserDeviceEntity } from './entities/user_device.entity';
import { notificationMessages, NotificationType } from './constant';
import { UserNotificationPreferenceEntity } from './entities/user_notification_preference.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  /**
   * Register a new device for a user.
   * If the device already exists, ignore.
   */
  async registerDevice(userId: number, onesignalId: string): Promise<void> {
    const exists = await this.notificationRepository.existsDevice(
      userId,
      onesignalId,
    );
    if (!exists) {
      await this.notificationRepository.addDevice(userId, onesignalId);
    }
  }

  /**
   * Get all devices for a given user.
   */
  async getDevices(userId: number): Promise<UserDeviceEntity[]> {
    return await this.notificationRepository.getDevicesByUserId(userId);
  }

  /**
   * Delete a device by its OneSignal ID.
   */
  async deleteDevice(onesignalId: string): Promise<void> {
    await this.notificationRepository.deleteDeviceByOneSignalId(onesignalId);
  }

  /**
   * Send a notification to a given user by notification type.
   */
  async send(userId: number, type: NotificationType): Promise<void> {
    // 1. Retrieve notification title/body from the mapping
    const message = notificationMessages[type];
    if (!message) {
      throw new Error(`Notification type ${type} not supported`);
    }

    // 2. Fetch user notification preferences
    const preferences =
      await this.notificationRepository.getPreferencesByUserId(userId);
    const pref = preferences.find((p) => p.type === type);

    // Skip if preference is missing or disabled
    if (!pref || !pref.enabled) {
      return;
    }

    // 3. Fetch all devices registered for this user
    const devices =
      await this.notificationRepository.getDevicesByUserId(userId);
    const onesignalIds = devices.map((d) => d.onesignalId);

    // 4. Send push notification if the user has at least one device
    if (onesignalIds.length > 0) {
      await this.notificationRepository.send(
        onesignalIds,
        message.title,
        message.body,
      );
    }
  }

  async getPreferencesByUserId(
    userId: number,
  ): Promise<UserNotificationPreferenceEntity[]> {
    return await this.notificationRepository.getPreferencesByUserId(userId);
  }

  async updateUserPreference(
    userId: number,
    type: string,
    enabled: boolean,
  ): Promise<void> {
    // we assume preference already exists (insert is done at user creation)
    await this.notificationRepository.updatePreference(userId, type, enabled);
  }
}
