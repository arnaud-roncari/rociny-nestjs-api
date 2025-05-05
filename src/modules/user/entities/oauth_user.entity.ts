export class OAuthUserEntity {
  id: number;
  userId: string;
  provider: string;
  providerUserId: string;

  constructor(parameters: OAuthUserEntity) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): OAuthUserEntity | null {
    if (!json) {
      return null;
    }

    return new OAuthUserEntity({
      id: json.id,
      userId: json.user_id,
      provider: json.provider,
      providerUserId: json.provider_user_id,
    });
  }

  static fromJsons(jsons: any[]): OAuthUserEntity[] {
    if (!jsons) {
      return [];
    }

    const entities: OAuthUserEntity[] = [];
    for (const json of jsons) {
      const entity = OAuthUserEntity.fromJson(json);
      if (entity) {
        entities.push(entity);
      }
    }
    return entities;
  }
}
