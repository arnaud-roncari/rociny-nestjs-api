export class InstagramAccountEntity {
  id: string;
  userId: string;
  instagramId: string;
  name: string;
  username: string;
  profilePictureUrl: string | null;
  followersCount: number | null;

  constructor(parameters: InstagramAccountEntity) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): InstagramAccountEntity | null {
    if (!json) {
      return null;
    }

    return new InstagramAccountEntity({
      id: json.id,
      userId: json.user_id,
      instagramId: json.instagram_id,
      name: json.name,
      username: json.username,
      profilePictureUrl: json.profile_picture_url || null,
      followersCount: json.followers_count ?? null,
    });
  }

  static fromJsons(jsons: any[]): InstagramAccountEntity[] {
    if (!jsons) {
      return [];
    }

    const entities: InstagramAccountEntity[] = [];
    for (const json of jsons) {
      const entity = InstagramAccountEntity.fromJson(json);
      if (entity) {
        entities.push(entity);
      }
    }
    return entities;
  }
}
