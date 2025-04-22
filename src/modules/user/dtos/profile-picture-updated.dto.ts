import { ApiProperty } from '@nestjs/swagger';

export class ProfilePictureUpdatedDto {
  constructor(profilePicture: string) {
    this.profile_picture = profilePicture;
  }
  @ApiProperty({ example: '<uuid>' })
  readonly profile_picture: string;
}
