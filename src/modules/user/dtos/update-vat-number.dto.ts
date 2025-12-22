import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateVATNumberDto {
  @IsString()
  @IsNotEmpty()
  readonly vat_number: string;
}
