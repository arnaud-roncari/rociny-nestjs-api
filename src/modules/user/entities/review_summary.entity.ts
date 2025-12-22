export class ReviewSummaryEntity {
  userId: number;
  name: string;
  profilePicture: string | null;
  description: string;

  constructor(params: {
    userId: number;
    name: string;
    profilePicture: string | null;
    description: string;
  }) {
    Object.assign(this, params);
  }

  static fromJson(json: any): ReviewSummaryEntity {
    return new ReviewSummaryEntity({
      userId: json.user_id,
      name: json.name,
      profilePicture: json.profile_picture ?? null,
      description: json.description,
    });
  }

  static fromJsons(jsons: any[]): ReviewSummaryEntity[] {
    return (jsons || []).map(ReviewSummaryEntity.fromJson);
  }
}
