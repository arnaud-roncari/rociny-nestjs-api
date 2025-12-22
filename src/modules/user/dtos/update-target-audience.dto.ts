import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateTargetAudienceDto {
  @IsArray()
  @IsNotEmpty()
  readonly target_audience: string[];
}
