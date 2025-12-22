export class UserDeviceEntity {
  constructor(
    public id: number,
    public userId: number,
    public onesignalId: string,
    public createdAt: Date,
  ) {}

  static fromJson(json: any): UserDeviceEntity {
    return new UserDeviceEntity(
      json.id,
      json.user_id,
      json.onesignal_id,
      new Date(json.created_at),
    );
  }

  static fromJsons(jsons: any[]): UserDeviceEntity[] {
    return (jsons || []).map(UserDeviceEntity.fromJson);
  }
}
