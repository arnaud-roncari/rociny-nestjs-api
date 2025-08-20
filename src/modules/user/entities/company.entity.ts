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

  collaborationAmount: number;
  averageStars: number;

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
      collaborationAmount: json.collaboration_amount ?? 0,
      averageStars:
        typeof json.average_stars === 'number'
          ? json.average_stars
          : parseFloat(json.average_stars) || 0,
    });
  }

  static fromJsons(jsons: any[]): CompanyEntity[] {
    if (!jsons) {
      return [];
    }

    return jsons
      .map((json) => CompanyEntity.fromJson(json))
      .filter((entity): entity is CompanyEntity => entity !== null);
  }
}
