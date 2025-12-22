import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateRepresentativeDto {
  @ApiProperty({ example: 'Alice' })
  @IsString()
  firstname_representative: string;

  @ApiProperty({ example: 'Durand' })
  @IsString()
  lastname_representative: string;
}
