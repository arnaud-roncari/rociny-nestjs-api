export class FetchedInstagramAccountEntity {
  id: string;
  name: string;
  username: string;
  profilePictureUrl: string | null;
  followersCount: number | null;

  constructor(parameters: FetchedInstagramAccountEntity) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): FetchedInstagramAccountEntity | null {
    if (!json) {
      return null;
    }

    return new FetchedInstagramAccountEntity({
      id: json.id,
      name: json.name,
      username: json.username,
      profilePictureUrl: json.profile_picture_url || null,
      followersCount: json.followers_count ?? null,
    });
  }

  static fromJsons(jsons: any[]): FetchedInstagramAccountEntity[] {
    if (!jsons) {
      return [];
    }

    const entities: FetchedInstagramAccountEntity[] = [];
    for (const json of jsons) {
      const entity = FetchedInstagramAccountEntity.fromJson(json);
      if (entity) {
        entities.push(entity);
      }
    }
    return entities;
  }
}
