export class InfluencerSummary {
  constructor(
    public id: number,
    public userId: number,
    public profilePicture: string,
    public portfolio: string[],
    public name: string,
    public followers: number,
  ) {}

  static fromJson(json: any): InfluencerSummary {
    return new InfluencerSummary(
      json.id,
      json.user_id,
      json.profile_picture,
      json.portfolio || [],
      json.name,
      json.followers_count || 0,
    );
  }
}
