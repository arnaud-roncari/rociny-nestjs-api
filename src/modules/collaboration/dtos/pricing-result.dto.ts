import { ApiProperty } from '@nestjs/swagger';

export class CollaborationPricingDto {
  @ApiProperty()
  estimatedViews: number;

  @ApiProperty()
  appliedCpm: number;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  minPrice: number;

  @ApiProperty()
  maxPrice: number;

  @ApiProperty()
  confidence: number;
}