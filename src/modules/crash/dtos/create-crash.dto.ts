import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCrashDto {
  @ApiProperty({
    example: '<exception>',
    description: 'Exception message',
  })
  @IsString()
  @IsNotEmpty()
  readonly exception: string;

  @ApiProperty({ example: '<stack>', description: 'Exception stack trace' })
  @IsString()
  @IsNotEmpty()
  readonly stack: string;
}
