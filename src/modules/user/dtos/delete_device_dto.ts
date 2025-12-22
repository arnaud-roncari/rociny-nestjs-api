import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteDeviceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  onesignal_id: string;
}
