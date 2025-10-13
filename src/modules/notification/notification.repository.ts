import { Injectable } from '@nestjs/common';
import { PostgresqlService } from '../postgresql/postgresql.service';
import { UserDeviceEntity } from './entities/user_device.entity';
import axios from 'axios';
import { NotificationType } from './constant';
import { UserNotificationPreferenceEntity } from './entities/user_notification_preference.entity';

@Injectable()
export class NotificationRepository {
  constructor(private readonly postgresqlService: PostgresqlService) {}

  /**
   * Get all devices registered for a given user.
   */
  async getDevicesByUserId(userId: number): Promise<UserDeviceEntity[]> {
    const query = `
      SELECT * 
      FROM api.user_devices
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const rows = await this.postgresqlService.query(query, [userId]);
    return UserDeviceEntity.fromJsons(rows);
  }

  /**
   * Check if a given OneSignal device ID already exists for a user.
   */
  async existsDevice(userId: number, onesignalId: string): Promise<boolean> {
    const query = `
      SELECT 1
      FROM api.user_devices
      WHERE user_id = $1 AND onesignal_id = $2
      LIMIT 1
    `;
    const rows = await this.postgresqlService.query(query, [
      userId,
      onesignalId,
    ]);
    return rows.length > 0;
  }

  /**
   * Delete a device by its OneSignal ID.
   */
  async deleteDeviceByOneSignalId(onesignalId: string): Promise<void> {
    const query = `
      DELETE FROM api.user_devices
      WHERE onesignal_id = $1
    `;
    await this.postgresqlService.query(query, [onesignalId]);
  }

  async removeDevice(userId: number, onesignalId: string): Promise<void> {
    const query = `
    DELETE FROM api.user_devices
    WHERE user_id = $1 AND onesignal_id = $2
  `;
    await this.postgresqlService.query(query, [userId, onesignalId]);
  }

  async addDevice(userId: number, onesignalId: string): Promise<void> {
    const query = `
    INSERT INTO api.user_devices (user_id, onesignal_id)
    VALUES ($1, $2)
  `;
    await this.postgresqlService.query(query, [userId, onesignalId]);
  }

  /**
   * Send a push notification to a specific list of OneSignal device IDs.
   */
  async send(
    onesignalIds: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (!onesignalIds || onesignalIds.length === 0) return;

    const url = 'https://onesignal.com/api/v1/notifications';

    await axios.post(
      url,
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: onesignalIds,
        headings: { en: title },
        contents: { en: body },
        data: data ?? {},
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  async initializePreferences(
    userId: number,
    defaultStatus = true,
  ): Promise<void> {
    const values = Object.values(NotificationType).map(
      (type) => `(${userId}, '${type}', ${defaultStatus})`,
    );

    const query = `
      INSERT INTO api.user_notification_preferences (user_id, type, enabled)
      VALUES ${values.join(', ')}
      ON CONFLICT (user_id, type) DO NOTHING
    `;

    await this.postgresqlService.query(query);
  }

  async getPreferencesByUserId(
    userId: number,
  ): Promise<UserNotificationPreferenceEntity[]> {
    const query = `
    SELECT * 
    FROM api.user_notification_preferences
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
    const rows = await this.postgresqlService.query(query, [userId]);
    return UserNotificationPreferenceEntity.fromJsons(rows);
  }

  async updatePreference(
    userId: number,
    type: string,
    enabled: boolean,
  ): Promise<void> {
    const query = `
    UPDATE api.user_notification_preferences
    SET enabled = $1, updated_at = now()
    WHERE user_id = $2 AND type = $3
  `;
    await this.postgresqlService.query(query, [enabled, userId, type]);
  }
}
