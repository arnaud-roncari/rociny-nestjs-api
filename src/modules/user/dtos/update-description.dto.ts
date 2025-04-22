import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateDescriptionDto {
  @IsString()
  @IsNotEmpty()
  readonly description: string;
}
