export class CollaboratedCompanyEntity {
  constructor(
    public id: number,
    public userId: number,
    public name: string,
    public profilePicture: string | null,
  ) {}

  static fromJson(json: any): CollaboratedCompanyEntity {
    return new CollaboratedCompanyEntity(
      json.id,
      json.user_id,
      json.name,
      json.profile_picture ?? null,
    );
  }

  static fromJsons(jsons: any[]): CollaboratedCompanyEntity[] {
    return (jsons || []).map(CollaboratedCompanyEntity.fromJson);
  }
}
