import { Injectable } from '@nestjs/common';
import { CollaborationRequestDto, ContentType, UsageRights, ExclusivityLevel } from '../dtos/collaboration-request.dto';
import { PostStatsDto } from '../dtos/post-stats.dto';
import { CollaborationPricingDto } from '../dtos/pricing-result.dto';
import { CollaborationBriefDto } from '../dtos/collaboration_brief.dto';
import { InfluencerRepositoryService } from '../repositories/influencer.repository';

@Injectable()
export class CollaborationPricingService {

  constructor(
  private readonly influencerRepository: InfluencerRepositoryService
) {}

  /**
   * Calcule le prix d'une collaboration influenceur
   */
  calculatePrice(
    influencerHistory: PostStatsDto[],
    request: CollaborationRequestDto
  ): CollaborationPricingDto {
    
    // 1. Prédire le nombre de vues attendues
    const predictedViews = this.predictViews(
      influencerHistory,
      request.contentType,
      new Date(request.publishDate)
    );

    // 2. Calculer le CPM adaptatif
    const cpm = this.calculateAdaptiveCpm(
      influencerHistory,
      request.contentType,
      request.nicheCategory
    );

    // 3. Calculer la composante CPA (pour approche hybride)
    const cpaComponent = this.calculateCpaComponent(
      predictedViews,
      this.estimateConversionRate(influencerHistory, request.contentType, request.destination),
      this.getTargetCpa(request.destination, request.contentType)
    );

    // 4. Appliquer les facteurs spécifiques à la demande
    const adjustedPrice = this.applySpecificFactors(
      (cpm * predictedViews) / 1000,
      cpaComponent,
      request.cmpWeight, // Correction: cmpWeight
      request.cpaWeight,
      request.destination,
      request.usageRights,
      request.exclusivity,
      this.getSeasonalFactor(new Date(request.publishDate))
    );

    // 5. Retourner le résultat complet
    return {
      estimatedViews: Math.round(predictedViews),
      appliedCpm: Math.round(cpm * 100) / 100,
      basePrice: Math.round(adjustedPrice * 100) / 100,
      minPrice: Math.round(adjustedPrice * 0.85 * 100) / 100,
      maxPrice: Math.round(adjustedPrice * 1.15 * 100) / 100,
      confidence: this.calculateConfidence(influencerHistory, request.contentType)
    };
  }

  /**
    * SECTION 1: PRÉDICTION DES VUES
   */
  private predictViews(
    influencerHistory: PostStatsDto[],
    contentType: ContentType,
    publishDate: Date
  ): number {
    
    // 1.1 Filtrer les données pertinentes
    const filteredPosts = influencerHistory
      .filter(post => post.contentType === contentType)
      .filter(post => !this.isOutlier(post, influencerHistory));

    // 1.2 Calculer les métriques clés
    const engagementRate = this.calculateEngagementRate(filteredPosts);
    const saveRatio = this.calculateSaveRatio(filteredPosts);
    const profileVisitRatio = this.calculateProfileVisitRatio(filteredPosts);
    const followerGrowth = this.calculateFollowerGrowth(filteredPosts);
    const reachStability = this.calculateReachStability(filteredPosts);

    // 1.3 Calculer la moyenne pondérée des vues avec décroissance exponentielle
    const weightedViews = this.calculateWeightedViews(filteredPosts);

    // 1.4 Appliquer le modèle de régression multivariée
    const predictedViews = weightedViews * (
      0.35 * (engagementRate / 0.02) +  // Normalisation par rapport à 2%
      0.20 * (saveRatio / 0.01) +       // Normalisation par rapport à 1%
      0.15 * (profileVisitRatio / 0.05) + // Normalisation par rapport à 5%
      0.10 * (followerGrowth / 0.005) + // Normalisation par rapport à 0.5%
      0.10 * reachStability +
      0.10 * this.getSeasonalFactor(publishDate)
    );

    // 1.5 Appliquer le facteur de confiance
    return this.applyConfidenceFactor(
      predictedViews,
      filteredPosts.length,
      this.calculateViewsVariability(filteredPosts)
    );
  }

  private calculateWeightedViews(posts: PostStatsDto[]): number {
    if (posts.length === 0) return 0;

    // Trier par date (du plus récent au plus ancien)
    const sortedPosts = posts.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let totalWeight = 0;
    let weightedSum = 0;

    for (let i = 0; i < sortedPosts.length; i++) {
      // Facteur de décroissance exponentielle (0.9^i)
      const weight = Math.pow(0.9, i);
      weightedSum += sortedPosts[i].views * weight;
      totalWeight += weight;
    }

    return weightedSum / totalWeight;
  }

  private applyConfidenceFactor(
    predictedViews: number,
    sampleSize: number,
    variability: number
  ): number {
    // Réduire la prédiction en fonction de la variabilité et la taille d'échantillon
    let confidenceFactor = Math.max(0.7, 1 - (variability / 2));

    // Facteur supplémentaire basé sur la taille de l'échantillon
    if (sampleSize < 5) confidenceFactor *= 0.8;
    else if (sampleSize < 10) confidenceFactor *= 0.9;

    return predictedViews * confidenceFactor;
  }

  private isOutlier(post: PostStatsDto, allPosts: PostStatsDto[]): boolean {
    const viewsList = allPosts.map(p => p.views);
    const mean = viewsList.reduce((a, b) => a + b, 0) / viewsList.length;

    // Calculer l'écart-type
    const sumSquaredDiffs = viewsList.reduce((sum, views) => sum + Math.pow(views - mean, 2), 0);
    const stdDev = Math.sqrt(sumSquaredDiffs / viewsList.length);

    // Considérer comme aberrant si > 2 écarts-types de la moyenne
    return Math.abs(post.views - mean) > 2 * stdDev;
  }

  /**
   * SECTION 2: CALCUL DU CPM ADAPTATIF
   */
  private calculateAdaptiveCpm(
    influencerHistory: PostStatsDto[],
    contentType: ContentType,
    nicheCategory: string
  ): number {
    
    // 2.1 Déterminer le CPM de base selon le format
    const baseCpm = this.getBaseCpm(contentType);

    // 2.2 Calculer les multiplicateurs
    const audienceMultiplier = this.getAudienceMultiplier(
      this.getFollowerCount(influencerHistory)
    );

    const engagementMultiplier = this.getEngagementMultiplier(
      this.calculateEngagementRate(influencerHistory),
      this.getNicheBenchmark(nicheCategory)
    );

    const qualityMultiplier = this.getQualityMultiplier(
      this.calculateSaveRatio(influencerHistory),
      this.calculateCommentRatio(influencerHistory)
    );

    const nicheMultiplier = this.getNicheMultiplier(nicheCategory);

    // 2.3 Appliquer tous les multiplicateurs au CPM de base
    return baseCpm * audienceMultiplier * engagementMultiplier * qualityMultiplier * nicheMultiplier;
  }

  private getBaseCpm(type: ContentType): number {
    const baseCPMMap = {
      [ContentType.STORY]: 8.0,
      [ContentType.REEL]: 9.0,
      [ContentType.POST]: 12.0,
      [ContentType.CONTEST]: 15.0
    };
    return baseCPMMap[type] || 10.0;
  }

  private getAudienceMultiplier(followers: number): number {
    if (followers < 10000) return 0.7;
    if (followers < 50000) return 0.8;
    if (followers < 100000) return 0.9;
    if (followers < 500000) return 1.0;
    if (followers < 1000000) return 1.2;
    if (followers < 5000000) return 1.5;
    return 2.0;
  }

  private getEngagementMultiplier(engagementRate: number, nicheBenchmark: number): number {
    const relativeEngagement = engagementRate / nicheBenchmark;

    if (relativeEngagement < 0.5) return 0.8;
    if (relativeEngagement < 0.8) return 0.9;
    if (relativeEngagement < 1.2) return 1.0;
    if (relativeEngagement < 1.5) return 1.2;
    if (relativeEngagement < 2.0) return 1.4;
    return 1.5;
  }
  /** 
  * SECTION 3: COMPOSANTE CPA
   */
  private calculateCpaComponent(
    predictedViews: number,
    conversionRate: number,
    targetCpa: number
  ): number {
    // Le nombre d'actions estimées × valeur par action
    return predictedViews * conversionRate * targetCpa;
  }

  private estimateConversionRate(
    history: PostStatsDto[],
    type: ContentType,
    destination: string
  ): number {
    // Base de taux de conversion selon le type de contenu
    let baseRate = 0.01; // 1% par défaut

    switch (type) {
      case ContentType.POST:
        baseRate = 0.008;
        break;
      case ContentType.STORY:
        baseRate = 0.005;
        break;
      case ContentType.REEL:
        baseRate = 0.01;
        break;
      case ContentType.CONTEST:
        baseRate = 0.015;
        break;
    }

    // Analyser l'historique pour affiner (si disponible)
    if (history.length > 0) {
      const similarPosts = history.filter(p => p.contentType === type);
      if (similarPosts.length > 0) {
        // Calculer le taux moyen de nouveaux followers générés
        const avgConversion = similarPosts
          .map(p => p.newFollowers / p.views)
          .reduce((a, b) => a + b, 0) / similarPosts.length;

        // Pondérer avec le taux de base (70% historique, 30% base)
        baseRate = (avgConversion * 0.7) + (baseRate * 0.3);
      }
    }

    // Ajuster en fonction de la destination
    const destinationFactor = this.getDestinationFactor(destination);

    return baseRate * destinationFactor;
  }

  private getTargetCpa(destination: string, type: ContentType): number {
    // Valeur CPA de base selon le type
    let baseCpa = 2.0;

    switch (type) {
      case ContentType.CONTEST:
        baseCpa = 3.5;
        break;
      case ContentType.POST:
        baseCpa = 2.5;
        break;
      case ContentType.REEL:
        baseCpa = 2.8;
        break;
      case ContentType.STORY:
        baseCpa = 1.8;
        break;
    }

    // Facteur géographique
    let geoFactor = 1.0;

    // Europe (référence)
    if (destination === 'europe_west' || destination === 'europe_south') {
      geoFactor = 1.0;
    }
    // Amérique du Nord
    else if (destination === 'usa' || destination === 'canada') {
      geoFactor = 1.3;
    }
    // Caraïbes & Amérique latine
    else if (destination === 'caraibe' || destination === 'amerique_latine') {
      geoFactor = 1.5;
    }
    // Asie
    else if (destination === 'asie_sudest' || destination === 'asie') {
      geoFactor = 1.7;
    }
    // Afrique / Moyen-Orient
    else if (destination === 'afrique' || destination === 'moyen_orient') {
      geoFactor = 1.6;
    }
    // Océanie & destinations lointaines
    else if (destination === 'oceanie') {
      geoFactor = 1.8;
    }

    return baseCpa * geoFactor;
  }

  /**
   * SECTION 4: FACTEURS D'AJUSTEMENT SPÉCIFIQUES
   */
  private applySpecificFactors(
    cpmPrice: number,
    cpaComponent: number,
    cmpWeight: number, // Correction: cmpWeight
    cpaWeight: number,
    destination: string,
    usageRights: UsageRights,
    exclusivity: ExclusivityLevel,
    seasonalFactor: number
  ): number {
    
    // 4.1 Calcul du prix hybride CPM/CPA
    const hybridBasePrice = (cpmPrice * cmpWeight) + (cpaComponent * cpaWeight);

    // 4.2 Ajustement pour les droits d'utilisation
    let usageRightsFactor = 1.0;
    switch (usageRights) {
      case UsageRights.STANDARD:
        usageRightsFactor = 1.0;
        break;
      case UsageRights.EXTENDED:
        usageRightsFactor = 1.2;
        break;
      case UsageRights.UNLIMITED:
        usageRightsFactor = 1.5;
        break;
    }

    // 4.3 Ajustement pour l'exclusivité
    let exclusivityFactor = 1.0;
    switch (exclusivity) {
      case ExclusivityLevel.NONE:
        exclusivityFactor = 1.0;
        break;
      case ExclusivityLevel.CATEGORY:
        exclusivityFactor = 1.25;
        break;
      case ExclusivityLevel.INDUSTRY:
        exclusivityFactor = 1.5;
        break;
    }

    // 4.4 Appliquer tous les facteurs d'ajustement
    return hybridBasePrice * usageRightsFactor * exclusivityFactor * seasonalFactor;
  }

  /**
   * MÉTHODES UTILITAIRES
   */
  private calculateEngagementRate(posts: PostStatsDto[]): number {
    if (posts.length === 0) return 0;
    
    let totalEngagement = 0;
    let totalReach = 0;

    for (const post of posts) {
      totalEngagement += (post.likes + post.comments + post.saves);
      totalReach += post.accountsReached;
    }

    return totalReach > 0 ? totalEngagement / totalReach : 0;
  }

  private calculateSaveRatio(posts: PostStatsDto[]): number {
    if (posts.length === 0) return 0;
    
    const totalSaves = posts.reduce((sum, p) => sum + p.saves, 0);
    const totalReach = posts.reduce((sum, p) => sum + p.accountsReached, 0);
    
    return totalReach > 0 ? totalSaves / totalReach : 0;
  }

  private calculateProfileVisitRatio(posts: PostStatsDto[]): number {
    if (posts.length === 0) return 0;
    
    const totalVisits = posts.reduce((sum, p) => sum + p.profileVisits, 0);
    const totalReach = posts.reduce((sum, p) => sum + p.accountsReached, 0);
    
    return totalReach > 0 ? totalVisits / totalReach : 0;
  }

  private calculateFollowerGrowth(posts: PostStatsDto[]): number {
    if (posts.length === 0) return 0;
    
    const totalGrowth = posts.reduce((sum, p) => sum + p.newFollowers, 0);
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    
    return totalViews > 0 ? totalGrowth / totalViews : 0;
  }

  private calculateReachStability(posts: PostStatsDto[]): number {
    if (posts.length < 2) return 1.0;

    const reaches = posts.map(p => p.accountsReached);
    const mean = reaches.reduce((a, b) => a + b, 0) / reaches.length;
    const variance = reaches.reduce((sum, reach) => sum + Math.pow(reach - mean, 2), 0) / reaches.length;
    const stdDev = Math.sqrt(variance);

    return mean > 0 ? Math.max(0, 1 - (stdDev / mean)) : 0;
  }

  private calculateViewsVariability(posts: PostStatsDto[]): number {
    if (posts.length < 2) return 0;

    const views = posts.map(p => p.views);
    const mean = views.reduce((a, b) => a + b, 0) / views.length;
    const variance = views.reduce((sum, view) => sum + Math.pow(view - mean, 2), 0) / views.length;

    return mean > 0 ? Math.sqrt(variance) / mean : 0;
  }

  private getFollowerCount(posts: PostStatsDto[]): number {
    // Estimation basée sur la portée moyenne
    if (posts.length === 0) return 0;
    
    const avgReach = posts.reduce((sum, p) => sum + p.accountsReached, 0) / posts.length;
    return Math.round(avgReach * 3); // Estimation: 1/3 des followers voient en moyenne un post
  }

  private getNicheBenchmark(niche: string): number {
    const benchmarks = {
      'voyage': 0.037,
      'fitness': 0.028,
      'beaute': 0.022,
      'mode': 0.019,
      'food': 0.031,
      'tech': 0.017,
      'lifestyle': 0.024
    };
    return benchmarks[niche] || 0.025;
  }

  private getNicheMultiplier(niche: string): number {
    const multipliers = {
      'voyage': 1.3,
      'fitness': 1.25,
      'beaute': 1.2,
      'mode': 1.15,
      'food': 1.1,
      'tech': 1.2,
      'lifestyle': 1.0
    };
    return multipliers[niche] || 1.0;
  }

  private getQualityMultiplier(saveRatio: number, commentRatio: number): number {
    let saveMultiplier = 1.0;
    if (saveRatio > 0.08) saveMultiplier = 1.3;
    else if (saveRatio > 0.05) saveMultiplier = 1.2;
    else if (saveRatio > 0.03) saveMultiplier = 1.1;

    let commentMultiplier = 1.0;
    if (commentRatio > 0.2) commentMultiplier = 1.3;
    else if (commentRatio > 0.15) commentMultiplier = 1.2;
    else if (commentRatio > 0.1) commentMultiplier = 1.1;

    return (saveMultiplier + commentMultiplier) / 2;
  }

  private calculateCommentRatio(posts: PostStatsDto[]): number {
    if (posts.length === 0) return 0;
    
    const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
    
    return totalLikes > 0 ? totalComments / totalLikes : 0;
  }

  private getDestinationFactor(destination: string): number {
    const factors = {
      'europe_west': 1.0,
      'europe_south': 1.0,
      'canada': 1.3,
      'usa': 1.4,
      'caraibe': 1.5,
      'asie': 1.7,
      'afrique': 1.6,
      'oceanie': 1.8
    };
    return factors[destination] || 1.2;
  }

  private getSeasonalFactor(date: Date): number {
    const month = date.getMonth() + 1; // getMonth() retourne 0-11

    // Facteurs saisonniers basés sur les mois
    if (month >= 11 || month <= 1) return 1.15; // Période des fêtes
    if (month >= 6 && month <= 8) return 0.9;   // Été (baisse d'engagement)
    if (month >= 3 && month <= 5) return 1.05;  // Printemps
    return 1.0; // Automne (normal)
  }

  private calculateConfidence(posts: PostStatsDto[], type: ContentType): number {
    const relevantPosts = posts.filter(p => p.contentType === type).length;

    if (relevantPosts >= 10) return 0.95;
    if (relevantPosts >= 5) return 0.85;
    if (relevantPosts >= 3) return 0.75;
    return 0.65;
  }
  private getFollowerCountJson(posts: PostStatsDto[], declaredFollowers: number): number {
  return declaredFollowers;
}

  recommendInfluencersForBrief(brief: CollaborationBriefDto): any[] {
  const allInfluencers = this.influencerRepository.getAllInfluencers();
  console.log('📊 Influenceurs chargés :', allInfluencers.length);

  const results = [];

  for (const influencer of allInfluencers) {
    const engagementRate = this.calculateEngagementRate(influencer.posts);
    const estimatedFollowers = this.getFollowerCountJson(influencer.posts, influencer.followers);

    console.log(`\n🔍 Évaluation de ${influencer.name}`);
    console.log(`  ➤ Engagement rate : ${engagementRate}`);
    console.log(`  ➤ Followers estimés : ${estimatedFollowers}`);
    console.log(`  ➤ Genre : ${influencer.gender}`);

    // Vérification des critères du brief
    const excludedByEngagement = engagementRate < brief.minEngagementRate;
    const excludedByFollowers = estimatedFollowers < brief.minReach;
    const excludedByGender = brief.targetGender &&
      brief.targetGender.toUpperCase() !== influencer.gender?.toUpperCase();

    if (excludedByEngagement || excludedByFollowers || excludedByGender) {
      console.log(`  ❌ Exclu pour :${
        excludedByEngagement ? ' taux engagement trop bas' : ''
      }${
        excludedByFollowers ? ' pas assez de followers' : ''
      }${
        excludedByGender ? ' genre non compatible' : ''
      }`);
      continue;
    }

    // Simulation de la demande
    const request = {
      contentType: brief.contentType,
      publishDate: brief.publishDate,
      nicheCategory: brief.nicheCategory,
      destination: brief.destination,
      cmpWeight: 0.6,
      cpaWeight: 0.4,
      usageRights: UsageRights[brief.usageRights as keyof typeof UsageRights],
      exclusivity: ExclusivityLevel[brief.exclusivity as keyof typeof ExclusivityLevel],
    };

    const result = this.calculatePrice(influencer.posts, request);

    console.log(`  💰 Prix estimé : ${result.basePrice} € (Budget max : ${brief.maxBudget})`);

    if (result.basePrice <= brief.maxBudget) {
      console.log('  ✅ Ajouté à la liste des résultats');
      results.push({
        influencer: influencer.name,
        estimatedPrice: result.basePrice,
        estimatedViews: result.estimatedViews,
        confidence: result.confidence,
      });
    } else {
      console.log('  ❌ Exclu (trop cher)');
    }
  }

  console.log(`\n📦 Résultats retenus : ${results.length}`);
  return results.sort((a, b) => b.confidence - a.confidence);
}

}