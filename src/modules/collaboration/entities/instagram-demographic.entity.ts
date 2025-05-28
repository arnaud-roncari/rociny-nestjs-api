export class InstagramDemographicsEntity {
  id?: number;
  instagram_account_id: string;
  type: 'age' | 'gender' | 'city';
  label: string;
  value: number;
  created_at: Date;

  constructor(data: InstagramDemographicsEntity) {
    Object.assign(this, data);
  }

  static fromJson(json: any): InstagramDemographicsEntity {
    return new InstagramDemographicsEntity({
      id: json.id,
      instagram_account_id: json.instagram_account_id,
      type: json.type,
      label: json.label,
      value: json.value,
      created_at: new Date(json.created_at),
    });
  }
}
