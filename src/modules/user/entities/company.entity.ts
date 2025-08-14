export class CompanyEntity {
  id: number;
  userId: number;
  profilePicture: string | null;
  name: string | null;
  department: string | null;
  description: string | null;
  stripeCustomerId: string;
  tradeName: string;
  city: string;
  street: string;
  postalCode: string;
  vatNumber: string;
  createdAt: Date;

  constructor(parameters: CompanyEntity) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): CompanyEntity | null {
    if (!json) {
      return null;
    }

    return new CompanyEntity({
      id: json.id,
      userId: json.user_id,
      profilePicture: json.profile_picture,
      name: json.name,
      tradeName: json.trade_name,
      city: json.city,
      street: json.street,
      postalCode: json.postal_code,
      vatNumber: json.vat_number,
      department: json.department,
      description: json.description,
      stripeCustomerId: json.stripe_customer_id,
      createdAt: json.created_at ? new Date(json.created_at) : new Date(),
    });
  }

  static fromJsons(jsons: any[]): CompanyEntity[] {
    if (!jsons) {
      return [];
    }

    const entities: CompanyEntity[] = [];
    for (const json of jsons) {
      const entitie = CompanyEntity.fromJson(json);
      if (entitie) {
        entities.push(entitie);
      }
    }
    return entities;
  }
}
