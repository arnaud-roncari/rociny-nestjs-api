import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNameDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
