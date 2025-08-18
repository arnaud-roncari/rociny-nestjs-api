// dtos/collaboration.dto.ts
import { Type } from 'class-transformer';
import { CollaborationEntity } from '../entities/collaboration.entity';
import { ProductPlacementEntity } from '../entities/product_placement.entity';

export class ProductPlacementDto {
  id: number;
  type: string;
  quantity: number;
  description: string;
  price: number;

  constructor(data: Partial<ProductPlacementDto>) {
    Object.assign(this, data);
  }

  static fromEntity(entity: ProductPlacementEntity): ProductPlacementDto {
    return new ProductPlacementDto({
      id: entity.id,
      type: entity.type,
      quantity: entity.quantity,
      description: entity.description,
      price: entity.price,
    });
  }

  static fromEntities(
    entities: ProductPlacementEntity[],
  ): ProductPlacementDto[] {
    return (entities || []).map(ProductPlacementDto.fromEntity);
  }
}

export class CollaborationDto {
  id: number;
  company_id: number;
  influencer_id: number;
  title: string;
  status: string;
  files: string[];
  platform_invoice?: string | null;
  influencer_invoice?: string | null;

  platform_quote?: string | null;
  influencer_quote?: string | null;
  created_at: Date;

  @Type(() => ProductPlacementDto)
  product_placements: ProductPlacementDto[];

  constructor(data: CollaborationDto) {
    Object.assign(this, data);
  }

  static fromEntity(entity: CollaborationEntity): CollaborationDto {
    return new CollaborationDto({
      id: entity.id,
      files: entity.files,
      company_id: entity.companyId,
      influencer_id: entity.influencerId,
      title: entity.title,
      status: entity.status,
      platform_invoice: entity.platformInvoice ?? null,
      influencer_invoice: entity.influencerInvoice ?? null,
      platform_quote: entity.platformQuote ?? null,
      influencer_quote: entity.influencerQuote ?? null,
      created_at: entity.createdAt,
      product_placements: ProductPlacementDto.fromEntities(
        entity.productPlacements,
      ),
    });
  }

  static fromEntities(entities: CollaborationEntity[]): CollaborationDto[] {
    return (entities || []).map(CollaborationDto.fromEntity);
  }
}
