export class OAuthUserEntity {
  id: number;
  userId: number;
  provider: string;
  providerUserId: string;
  accessToken: string;
  tokenExpiration: Date;

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
      accessToken: json.access_token,
      tokenExpiration: json.token_expiration
        ? new Date(json.token_expiration)
        : null,
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
