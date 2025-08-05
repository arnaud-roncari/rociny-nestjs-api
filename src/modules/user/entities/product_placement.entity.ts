export class ProductPlacementEntity {
  id: number;
  collaborationId: number;
  type: string;
  quantity: number;
  description: string;
  price: number;
  createdAt: Date;

  constructor(params: ProductPlacementEntity) {
    Object.assign(this, params);
  }

  static fromJson(json: any): ProductPlacementEntity {
    return new ProductPlacementEntity({
      id: json.id,
      collaborationId: json.collaboration_id,
      type: json.type,
      quantity: json.quantity,
      description: json.description,
      price: json.price,
      createdAt: new Date(json.created_at),
    });
  }

  static fromJsons(jsons: any[]): ProductPlacementEntity[] {
    return (jsons || []).map(ProductPlacementEntity.fromJson);
  }
}
