export class InstagramProfileEntity {
  username: string;
  profilePictureUrl: string;
  followersCount: number;

  constructor(params: InstagramProfileEntity) {
    this.username = params.username;
    this.profilePictureUrl = params.profilePictureUrl;
    this.followersCount = params.followersCount;
  }

  static fromResponse(data: any): InstagramProfileEntity {
    return new InstagramProfileEntity({
      username: data.username ?? '',
      profilePictureUrl: data.profile_picture_url ?? '',
      followersCount:
        typeof data.followers_count === 'number' ? data.followers_count : 0,
    });
  }
}
