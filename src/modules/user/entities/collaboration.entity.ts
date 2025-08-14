import { ProductPlacementEntity } from './product_placement.entity';

export interface CollaborationEntityParams {
  id: number;
  companyId: number;
  influencerId: number;
  title: string;
  files: string[];
  status: string;
  createdAt: Date;
  productPlacements: ProductPlacementEntity[];
}

export class CollaborationEntity {
  id: number;
  companyId: number;
  influencerId: number;
  title: string;
  files: string[];
  status: string;
  createdAt: Date;
  productPlacements: ProductPlacementEntity[];

  constructor(params: CollaborationEntityParams) {
    Object.assign(this, params);
  }

  static fromJson(json: any): CollaborationEntity {
    return new CollaborationEntity({
      id: json.id,
      companyId: json.company_id,
      influencerId: json.influencer_id,
      title: json.title,
      files: json.files || [],
      status: json.status,
      createdAt: new Date(json.created_at),
      productPlacements: ProductPlacementEntity.fromJsons(
        json.product_placements ?? [],
      ),
    });
  }

  static fromJsons(jsons: any[]): CollaborationEntity[] {
    return (jsons || []).map(CollaborationEntity.fromJson);
  }

  getPrice(): number {
    return (this.productPlacements || []).reduce(
      (sum, placement) => sum + (placement.price || 0),
      0,
    );
  }

  getPriceWithCommission(): number {
    const basePrice = this.getPrice();
    return basePrice * 1.05;
  }
}
