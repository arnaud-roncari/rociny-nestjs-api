import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsInt() collaboration_id: number;
  @IsInt() reviewed_id: number;
  @IsInt() @Min(1) @Max(5) stars: number;
  @IsOptional() @IsString() description: string;
}
