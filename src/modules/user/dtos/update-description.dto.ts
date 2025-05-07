import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDescriptionDto {
  @IsString()
  @IsNotEmpty()
  readonly description: string;
}
