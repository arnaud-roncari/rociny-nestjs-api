import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateThemesDto {
  @IsArray()
  @IsNotEmpty()
  readonly themes: string[];
}
