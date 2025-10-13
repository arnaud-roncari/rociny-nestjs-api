import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateSiretDto {
  @ApiProperty({ example: '12345678900019' })
  @IsString()
  readonly siret: string;
}
