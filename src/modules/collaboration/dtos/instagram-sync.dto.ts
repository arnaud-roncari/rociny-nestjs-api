import { ApiProperty } from '@nestjs/swagger';

export class SyncInstagramDto {
  @ApiProperty()
  instagram_id: string;
}
