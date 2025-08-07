import { Injectable } from '@nestjs/common';
import { ProductPlacementType } from 'src/commons/enums/product_placement_type';
import { FacebookService } from '../facebook/facebook.service';
import {
  AUDIENCE_MULTIPLIERS,
  BASE_CPM,
  CONVERSION_RATES,
  CPA_TARGETS,
  ENGAGEMENT_MULTIPLIERS,
  SEASONAL_BOOSTS,
  THEME_BENCHMARKS,
  THEME_MULTIPLIERS,
} from './constants';
import { InfluencerService } from '../user/services/inlfuencer.service';
import { Theme } from 'src/commons/enums/theme';

@Injectable()
export class PriceAlgorithmService {
  constructor(
    private readonly facebookService: FacebookService,
    private readonly influencerService: InfluencerService,
  ) {}

  async calculateProductPlacementPrice(
    userId: number,
    productPlacementType: ProductPlacementType,
  ) {
    const stats = await this.facebookService.getInstagramAccount(userId);
    const influencer = await this.influencerService.getInfluencer(userId);

    // Step 1: Compute base CPM adjusted with multipliers
    const baseCPM = BASE_CPM[productPlacementType];
    const themesMultiplier = this.getThemesMultiplier(influencer.themes);
    const audienceMultiplier = this.getAudienceMultiplier(stats.followersCount);
    const engagementMultiplier = this.getEngagementMultiplier(
      stats.engagementRate,
      influencer.themes,
    );

    const CPM =
      baseCPM * themesMultiplier * audienceMultiplier * engagementMultiplier;

    // Step 2: Compute weighted average views over time (with decay)
    const totalViews = stats.viewsHistory.reduce((sum, v) => sum + v.views, 0);
    const weights = stats.viewsHistory
      .map((v) => this.computeWeight(new Date(v.date)))
      .reduce((sum, w) => sum + w, 0);

    const weightedAverage = totalViews / weights;

    // Apply seasonality based on current month and influencer themes
    const seasonalBoost = this.computeSeasonalBoost(influencer.themes);
    const adjustedAverage = weightedAverage * seasonalBoost;

    // Step 3: Compute CPA-based price
    const cpaTarget = this.getCPATarget(influencer.themes);
    const conversionRate = this.getConversionRate(influencer.themes);
    const CPAPrice = adjustedAverage * conversionRate * cpaTarget;

    // Step 4: Compute final hybrid price (mix of CPM and CPA)
    const CPMPrice = (CPM * adjustedAverage) / 1000;
    const HybridPrice = CPAPrice * 0.3 + CPMPrice * 0.7;

    return Math.floor(HybridPrice);
  }

  /**
   * Computes the average seasonal boost based on the influencer's themes
   * and the current month.
   */
  private computeSeasonalBoost(
    themes: string[],
    pubDate: Date = new Date(),
  ): number {
    const ts = Theme.fromStrings(themes);
    const month = pubDate.getMonth() + 1;

    const boosts = ts.map((theme) => {
      const periods = SEASONAL_BOOSTS[theme] ?? [];

      for (const period of periods) {
        const [start, end] = period.months;

        if (start <= end) {
          if (month >= start && month <= end) {
            return period.boost;
          }
        } else {
          if (month >= start || month <= end) {
            return period.boost;
          }
        }
      }

      return 1.0;
    });

    const sum = boosts.reduce((acc, b) => acc + b, 0);
    return boosts.length > 0 ? sum / boosts.length : 1.0;
  }

  /**
   * Returns a multiplier based on the influencer's number of followers.
   * The larger the audience, the lower the multiplier (due to lower niche engagement).
   */
  private getAudienceMultiplier(followersCount: number): number {
    const range = AUDIENCE_MULTIPLIERS.find(
      (range) => followersCount >= range.min && followersCount < range.max,
    );
    return range?.multiplier || 1.0; // Default to 1.0 if no matching range
  }

  /**
   * Calculates the average CPA (Cost Per Acquisition) target based on the influencer's themes.
   * Each theme has a different CPA expectation depending on industry benchmarks.
   */
  private getCPATarget(themes: string[]): number {
    const ts = Theme.fromStrings(themes);
    const multipliers = ts.map((theme) => CPA_TARGETS[theme] ?? 1.0);

    if (multipliers.length === 0) return 1.0;

    // Return average CPA target
    return multipliers.reduce((sum, m) => sum + m, 0) / multipliers.length;
  }

  /**
   * Calculates the average conversion rate for the influencer’s themes.
   * Useful to estimate how many views are likely to convert into actions/sales.
   */
  private getConversionRate(themes: string[]): number {
    const ts = Theme.fromStrings(themes);
    const multipliers = ts.map((theme) => CONVERSION_RATES[theme] ?? 1.0);

    if (multipliers.length === 0) return 1.0;

    // Return average conversion rate
    return multipliers.reduce((sum, m) => sum + m, 0) / multipliers.length;
  }

  /**
   * Calculates the average value multiplier for the influencer’s themes.
   * Some niches are more valuable for advertisers (e.g. luxury, finance).
   */
  private getThemesMultiplier(themes: string[]): number {
    const ts = Theme.fromStrings(themes);
    const multipliers = ts.map((theme) => THEME_MULTIPLIERS[theme] ?? 1.0);

    if (multipliers.length === 0) return 1.0;

    // Return average theme multiplier
    return multipliers.reduce((sum, m) => sum + m, 0) / multipliers.length;
  }

  /**
   * Returns the average engagement benchmark across all influencer themes.
   * Used to compare the influencer's engagement rate with industry averages.
   */
  private getThemesBenchmarkMultiplier(themes: string[]): number {
    const ts = Theme.fromStrings(themes);
    const multipliers = ts.map((theme) => THEME_BENCHMARKS[theme] ?? 1.0);

    if (multipliers.length === 0) return 1.0;

    // Return average benchmark
    return multipliers.reduce((sum, m) => sum + m, 0) / multipliers.length;
  }

  /**
   * Computes an engagement multiplier based on how the influencer's
   * engagement rate compares to their theme's benchmark.
   */
  private getEngagementMultiplier(
    engagementRate: number,
    themes: string[],
  ): number {
    const benchmark = this.getThemesBenchmarkMultiplier(themes);
    const ratio = engagementRate / benchmark;

    const range = ENGAGEMENT_MULTIPLIERS.find(
      (range) => ratio >= range.min && ratio < range.max,
    );

    return range?.multiplier || 1.0;
  }

  /**
   * Computes a time-decay weight for a post based on its age.
   * Recent posts have higher influence; older ones are discounted.
   */
  private computeWeight(pubDate: Date, today: Date = new Date()): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.floor((today.getTime() - pubDate.getTime()) / msPerDay);

    let exponent: number;
    if (days <= 7) {
      exponent = 0;
    } else {
      exponent = Math.ceil(days / 7) - 1;
      exponent = Math.min(exponent, 4);
    }

    return Math.pow(0.9, exponent);
  }
}
