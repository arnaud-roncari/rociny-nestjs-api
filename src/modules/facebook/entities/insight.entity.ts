export class InsightsEntity {
  reach: number;
  views: number;
  profileViews: number;
  websiteClicks: number;
  profileLinksTaps: number;
  totalInteractions: number;
  engagementRate: number | null;
  profileViewRate: number | null;

  constructor(params: InsightsEntity) {
    this.reach = params.reach;
    this.views = params.views;
    this.profileViews = params.profileViews;
    this.websiteClicks = params.websiteClicks;
    this.profileLinksTaps = params.profileLinksTaps;
    this.totalInteractions = params.totalInteractions;
    this.engagementRate = params.engagementRate;
    this.profileViewRate = params.profileViewRate;
  }

  static fromResponse(response: any): InsightsEntity {
    const data = response?.data ?? [];

    const _getMetricValue = (metricName: string): number => {
      const entry = data?.data?.find((item: any) => item.name === metricName);
      const value = entry?.total_value?.value ?? 0;
      return typeof value === 'number' ? value : 0;
    };

    const reach = _getMetricValue('reach');
    const profileViews = _getMetricValue('profile_views');
    const totalInteractions = _getMetricValue('total_interactions');

    const engagementRate =
      reach > 0 ? Math.round((totalInteractions / reach) * 100) : null;

    const profileViewRate =
      reach > 0 ? Math.round((profileViews / reach) * 100) : null;

    return new InsightsEntity({
      reach,
      views: _getMetricValue('views'),
      profileViews,
      websiteClicks: _getMetricValue('website_clicks'),
      profileLinksTaps: _getMetricValue('profile_links_taps'),
      totalInteractions,
      engagementRate,
      profileViewRate,
    });
  }
}
