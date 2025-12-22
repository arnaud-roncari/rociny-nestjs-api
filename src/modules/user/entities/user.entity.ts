import { AccountType } from 'src/commons/enums/account_type';

export class UserEntity {
  id: number;
  email: string;
  passwordHash: string;
  accountType: AccountType;
  picturePath: string;
  createdAt: Date;

  constructor(parameters: UserEntity) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): UserEntity | null {
    if (!json) {
      return null;
    }

    return new UserEntity({
      id: json.id,
      email: json.email,
      passwordHash: json.password_hash,
      picturePath: json.picture_path,
      accountType: json.account_type,
      createdAt: new Date(json.created_at),
    });
  }

  static fromJsons(jsons: any[]): UserEntity[] {
    if (!jsons) {
      return [];
    }

    const entities: UserEntity[] = [];
    for (const json of jsons) {
      const entitie = UserEntity.fromJson(json);
      if (entitie) {
        entities.push(entitie);
      }
    }
    return entities;
  }
}
