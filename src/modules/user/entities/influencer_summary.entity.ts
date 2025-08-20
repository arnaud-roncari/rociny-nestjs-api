export class InfluencerSummary {
  constructor(
    public id: number,
    public userId: number,
    public profilePicture: string,
    public portfolio: string[],
    public name: string,
    public followers: number,
    public collaborationAmount: number,
    public averageStars: number,
  ) {}

  static fromJson(json: any): InfluencerSummary {
    return new InfluencerSummary(
      json.id,
      json.user_id,
      json.profile_picture,
      json.portfolio || [],
      json.name,
      json.followers_count || 0,
      json.collaboration_amount || 0,
      parseFloat(json.average_stars) || 0,
    );
  }

  static fromJsons(jsons: any[]): InfluencerSummary[] {
    return (jsons || []).map((json) => InfluencerSummary.fromJson(json));
  }
}
