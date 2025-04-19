import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateTargetAudienceDto {
  @IsArray()
  @IsNotEmpty()
  readonly target_audience: string[];
}
