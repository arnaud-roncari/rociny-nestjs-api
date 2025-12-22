export class UserNotificationPreferenceEntity {
  constructor(
    public id: number,
    public userId: number,
    public type: string,
    public enabled: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  static fromJson(json: any): UserNotificationPreferenceEntity {
    return new UserNotificationPreferenceEntity(
      json.id,
      json.user_id,
      json.type,
      json.enabled,
      new Date(json.created_at),
      new Date(json.updated_at),
    );
  }

  static fromJsons(jsons: any[]): UserNotificationPreferenceEntity[] {
    return (jsons || []).map(UserNotificationPreferenceEntity.fromJson);
  }
}
