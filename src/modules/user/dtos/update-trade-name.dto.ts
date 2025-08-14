import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTradeNameDto {
  @IsString()
  @IsNotEmpty()
  readonly trade_name: string;
}
