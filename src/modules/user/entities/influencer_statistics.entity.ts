export class InfluencerStatisticsEntity {
  // Revenue generated from collaborations in the last 30 days
  revenue: number;

  // Average rating from "done" collaborations in the last 30 days
  averageRating: number;

  // Number of profile views in the last 30 days
  profileViews: number;

  // Number of collaborations in the last 30 days
  collaborationsCount: number;

  // Number of product placements in the last 30 days
  placementsCount: number;

  constructor(parameters: InfluencerStatisticsEntity) {
    Object.assign(this, parameters);
  }

  static fromJson(json: any): InfluencerStatisticsEntity {
    return new InfluencerStatisticsEntity({
      revenue: Number(json.revenue) || 0,
      averageRating: Number(json.average_rating) || 0,
      profileViews: Number(json.profile_views) || 0,
      collaborationsCount: Number(json.collaborations_count) || 0,
      placementsCount: Number(json.placements_count) || 0,
    });
  }
}
