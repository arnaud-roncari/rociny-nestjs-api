import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody  } from '@nestjs/swagger';
import { CollaborationPricingService } from '../services/collaboration-pricing.service';
import { CollaborationRequestDto } from '../dtos/collaboration-request.dto';
import { PostStatsDto } from '../dtos/post-stats.dto';
import { CollaborationPricingDto } from '../dtos/pricing-result.dto';
import * as fs from 'fs';
import * as path from 'path';
import { CollaborationBriefDto } from '../dtos/collaboration_brief.dto';

@ApiTags('Influencer Pricing')
@Controller('influencer-pricing')
export class CollaborationPricingController {
  constructor(
    private readonly collaborationPricingService: CollaborationPricingService
  ) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calcule le prix d\'une collaboration influenceur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prix calculé avec succès',
    type: CollaborationPricingDto 
  })
  @ApiBody({
  schema: {
    example: {
      influencerHistory: [
        {
          date: "2024-04-10",
          views: 7823,
          likes: 498,
          comments: 93,
          saves: 47,
          profileVisits: 287,
          newFollowers: 38,
          accountsReached: 5238,
          contentType: "POST"
        }
      ],
      request: {
        contentType: "POST",
        publishDate: "2025-06-01",
        nicheCategory: "beaute",
        destination: "europe_west",
        cmpWeight: 0.6,
        cpaWeight: 0.4,
        usageRights: "STANDARD",
        exclusivity: "NONE"
      }
    }
  }
})
  calculateCollaborationPrice(
    @Body() body?: {
      influencerHistory: PostStatsDto[];
      request: CollaborationRequestDto;
    }
  ): CollaborationPricingDto {
    // Si aucun body fourni, charger les données par défaut
    if (!body || !body.influencerHistory || !body.request) {
      const defaultDataPath = path.join(__dirname, '../data/laura_dumont_input.json');
      const rawData = fs.readFileSync(defaultDataPath, 'utf-8');
      body = JSON.parse(rawData);
    }

    return this.collaborationPricingService.calculatePrice(
      body.influencerHistory,
      body.request
    );
  }

  @Post('recommend')
  @ApiOperation({ summary: 'Recommande les meilleurs influenceurs pour un brief donné' })
  @ApiBody({
    description: 'Brief marketing de la marque',
    type: CollaborationBriefDto,
    examples: {
      naturalGlow: {
        summary: 'Exemple : campagne NaturalGlow',
        value: {
          ageRange: [25, 54],
          targetGender: 'FEMALE',
          minEngagementRate: 0.03,
          minReach: 50000,
          maxBudget: 1500,
          campaignGoal: 'SALES',
          nicheCategory: 'beaute',
          contentType: 'POST',
          publishDate: '2025-06-01',
          destination: 'europe_west',
          usageRights: 'STANDARD',
          exclusivity: 'NONE'
        }
      }
    }
  })
  recommendInfluencers(@Body() brief: CollaborationBriefDto) {
    return this.collaborationPricingService.recommendInfluencersForBrief(brief);
  }
  
}