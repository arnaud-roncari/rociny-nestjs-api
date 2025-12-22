import { IsInt, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductPlacementDto {
  @IsString()
  type: string;

  @IsInt()
  quantity: number;

  @IsString()
  description: string;

  @IsInt()
  price: number;
}

export class CreateCollaborationDto {
  @IsInt()
  influencer_id: number;

  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductPlacementDto)
  product_placements: CreateProductPlacementDto[];
}
