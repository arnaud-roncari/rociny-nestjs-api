import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateNameDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
