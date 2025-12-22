import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateThemesDto {
  @IsArray()
  @IsNotEmpty()
  readonly themes: string[];
}
