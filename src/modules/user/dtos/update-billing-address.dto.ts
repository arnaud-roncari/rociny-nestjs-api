import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBillingAddress {
  @IsString()
  @IsNotEmpty()
  readonly street: string;

  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @IsString()
  @IsNotEmpty()
  readonly postal_code: string;
}
