import { ApiProperty } from '@nestjs/swagger';
export class LoggedDto {
  constructor(accessToken: string) {
    this.access_token = accessToken;
  }
  @ApiProperty({ example: '<token>', description: 'JWT token' })
  readonly access_token: string;
}
