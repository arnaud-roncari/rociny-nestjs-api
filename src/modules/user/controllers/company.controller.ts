import {
  Controller,
  Put,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  StreamableFile,
  Get,
  Param,
  Body,
  Post,
  Delete,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProfilePictureUpdatedDto } from '../dtos/profile-picture-updated.dto';
import { IdFromJWT } from 'src/commons/decorators/id-from-jwt.decorators';
import { AuthGuard } from 'src/commons/guards/auth.guard';
import { UpdateNameDto } from '../dtos/update-name.dto';
import { UpdateDescriptionDto } from '../dtos/update-description.dto';
import { UpdateDepartmentDto } from '../dtos/update-department.dto';
import { CreateSocialNetworkDto } from '../dtos/create-social-network.dto';
import { SocialNetworkDto } from '../dtos/social-network.dto';
import { UpdateSocialNetworkDto } from '../dtos/update-social-network.dto';
import { LegalDocumentType } from 'src/commons/enums/legal_document_type';
import { CompanyService } from '../services/company.service';
import { FacebookService } from 'src/modules/facebook/facebook.service';
import { InstagramAccountDto } from 'src/modules/facebook/dtos/instagram_account.dto';
import { CompanyProfileCompletionStatusDto } from '../dtos/company-profile-completion-status.dto';
import { CompanyDto } from '../dtos/company.dto';
import { InfluencerSummaryDto } from '../dtos/influencer-summary.dto';
import { SearchInfluencersByThemeDto } from '../dtos/search-influencers-by-theme.dto';
import { SearchInfluencersByFiltersDto } from '../dtos/search-influencers-by-filters.dto';
import { InfluencerService } from '../services/influencer.service';
import { InfluencerDto } from '../dtos/influencer.dto';
import { InfluencerProfileCompletionStatusDto } from '../dtos/influencer-profile-completion-status.dto';
import { CollaborationService } from '../services/collaboration.service';
import { CreateCollaborationDto } from '../dtos/create-collaboration.dto';
import { BucketType } from 'src/commons/enums/bucket_type';
import { MinioService } from 'src/modules/minio/minio.service';
import { CollaborationDto } from '../dtos/collaboration.dto';
import { PriceAlgorithmService } from 'src/modules/price_algorithm/price_algorithm.service';
import { ProductPlacementType } from 'src/commons/enums/product_placement_type';
import { CollaborationSummaryDto } from '../dtos/collaboration-summary.dto';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { ReviewDto } from '../dtos/review.dto';
import { UpdateTradeNameDto } from '../dtos/update-trade-name.dto';
import { UpdateVATNumberDto } from '../dtos/update-vat-number.dto';
import { UpdateBillingAddress } from '../dtos/update-billing-address.dto';
import { ReviewSummaryDto } from '../dtos/review_summary.dto';
import { CollaboratedCompanyDto } from '../dtos/collaborated_company.dto';
import { ConversationSummaryDto } from 'src/modules/conversation/dtos/conversation.dto';
import { ConversationService } from 'src/modules/conversation/conversation.service';
import { MessageDto } from 'src/modules/conversation/dtos/message.dto';
import { AddMessageDto } from 'src/modules/conversation/dtos/add-message.dto';
import { NotificationService } from 'src/modules/notification/notification.service';
import { UserNotificationPreferenceDto } from 'src/modules/notification/dto/user_notification_preference.dto';
import { UpdateUserNotificationPreferenceDto } from 'src/modules/notification/dto/update_user_notification_preference.dto';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly influencerService: InfluencerService,
    private readonly facebookService: FacebookService,
    private readonly collaborationService: CollaborationService,
    private readonly minioService: MinioService,
    private readonly priceAlgorithmService: PriceAlgorithmService,
    private readonly conversationService: ConversationService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Upload or update company profile picture.
   */
  @ApiOperation({ summary: 'Upload or update profile picture' })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @Put('profile-picture')
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @IdFromJWT() userId: number,
  ): Promise<ProfilePictureUpdatedDto> {
    const newProfilePicture: string =
      await this.companyService.updateProfilePicture(userId, file);
    return new ProfilePictureUpdatedDto(newProfilePicture);
  }

  /**
   * Stream any company profile picture by filename.
   */
  @ApiOperation({ summary: 'Stream profile picture by filename' })
  @Get('profile-pictures/:filename')
  async getProfilePicturebyFilename(
    @Param('filename') filename: string,
  ): Promise<StreamableFile> {
    const stream =
      await this.companyService.getProfilePictureByFilename(filename);
    return new StreamableFile(stream);
  }

  /**
   * Update company name.
   */
  @ApiOperation({ summary: 'Update name' })
  @UseGuards(AuthGuard)
  @Put('name')
  async updateName(
    @IdFromJWT() userId: number,
    @Body() body: UpdateNameDto,
  ): Promise<void> {
    await this.companyService.updateName(userId, body.name);
  }

  /**
   * Update company trade name.
   */
  @ApiOperation({ summary: 'Update trade name' })
  @UseGuards(AuthGuard)
  @Put('trade-name')
  async updateTradeName(
    @IdFromJWT() userId: number,
    @Body() body: UpdateTradeNameDto,
  ): Promise<void> {
    await this.companyService.updateTradeName(userId, body.trade_name);
  }

  /**
   * Update VAT number.
   */
  @ApiOperation({ summary: 'Update VAT number' })
  @UseGuards(AuthGuard)
  @Put('vat-number')
  async updateVATNumber(
    @IdFromJWT() userId: number,
    @Body() body: UpdateVATNumberDto,
  ): Promise<void> {
    await this.companyService.updateVATNumber(userId, body.vat_number);
  }

  /**
   * Update billing address.
   */
  @ApiOperation({ summary: 'Update billing address' })
  @UseGuards(AuthGuard)
  @Put('billing-address')
  async updateBillingAddress(
    @IdFromJWT() userId: number,
    @Body() body: UpdateBillingAddress,
  ): Promise<void> {
    await this.companyService.updateBillingAddress(
      userId,
      body.city,
      body.street,
      body.postal_code,
    );
  }

  /**
   * Update description.
   */
  @ApiOperation({ summary: 'Update description' })
  @UseGuards(AuthGuard)
  @Put('description')
  async updateDescription(
    @IdFromJWT() userId: number,
    @Body() body: UpdateDescriptionDto,
  ): Promise<void> {
    await this.companyService.updateDescription(userId, body.description);
  }

  /**
   * Update department.
   */
  @ApiOperation({ summary: 'Update department' })
  @UseGuards(AuthGuard)
  @Put('department')
  async updateDepartment(
    @IdFromJWT() userId: number,
    @Body() body: UpdateDepartmentDto,
  ): Promise<void> {
    await this.companyService.updateDepartment(userId, body.department);
  }

  /**
   * Add a social network to company profile.
   */
  @ApiOperation({ summary: 'Add social network' })
  @UseGuards(AuthGuard)
  @Post('social-networks')
  async addSocialNetwork(
    @IdFromJWT() userId: number,
    @Body() body: CreateSocialNetworkDto,
  ): Promise<void> {
    await this.companyService.createSocialNetwork(
      userId,
      body.platform,
      body.url,
    );
  }

  /**
   * Get all company social networks.
   */
  @ApiOperation({ summary: 'Get social networks' })
  @UseGuards(AuthGuard)
  @Get('social-networks')
  async getSocialNetworks(
    @IdFromJWT() userId: number,
  ): Promise<SocialNetworkDto[]> {
    const sn = await this.companyService.getSocialNetworks(userId);
    return SocialNetworkDto.fromEntities(sn);
  }

  /**
   * Delete a social network.
   */
  @ApiOperation({ summary: 'Delete social network' })
  @UseGuards(AuthGuard)
  @Delete('social-networks/:id')
  async deleteSocialNetwork(
    @IdFromJWT() userId: number,
    @Param('id') socialNetworkId: string,
  ): Promise<void> {
    await this.companyService.deleteSocialNetwork(userId, socialNetworkId);
  }

  /**
   * Update a social network.
   */
  @ApiOperation({ summary: 'Update social network' })
  @UseGuards(AuthGuard)
  @Put('social-networks/:id')
  async updateSocialNetwork(
    @IdFromJWT() userId: number,
    @Param('id') socialNetworkId: string,
    @Body() body: UpdateSocialNetworkDto,
  ): Promise<void> {
    await this.companyService.updateSocialNetwork(
      userId,
      socialNetworkId,
      body.url,
    );
  }

  /**
   * Add a new legal document.
   */
  @ApiOperation({ summary: 'Add legal document' })
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('legal-documents/:type')
  async addLegalDocument(
    @IdFromJWT() userId: number,
    @Param('type') type: LegalDocumentType,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    await this.companyService.addLegalDocument(userId, type, file);
  }

  /**
   * Delete a legal document.
   */
  @ApiOperation({ summary: 'Delete legal document' })
  @UseGuards(AuthGuard)
  @Delete('legal-documents/:type')
  async deleteLegalDocument(
    @Param('type') type: LegalDocumentType,
    @IdFromJWT() userId: number,
  ): Promise<void> {
    await this.companyService.deleteLegalDocument(userId, type);
  }

  /**
   * Get status of a legal document.
   */
  @ApiOperation({ summary: 'Get legal document status' })
  @UseGuards(AuthGuard)
  @Get('legal-documents/:type/status')
  async getLegalDocumentStatus(
    @Param('type') type: LegalDocumentType,
    @IdFromJWT() userId: number,
  ): Promise<any> {
    const status = await this.companyService.getLegalDocumentStatus(
      userId,
      type,
    );
    return { status: status };
  }

  /**
   * Create a new Stripe SetupIntent for saving a payment method.
   */
  @UseGuards(AuthGuard)
  @Post('payments/setup-intent')
  async createSetupIntent(@IdFromJWT() userId: number): Promise<any> {
    const company = await this.companyService.getCompany(userId);
    const setupIntent = await this.companyService.createSetupIntent(userId);
    const ephemeralKey = await this.companyService.createEphemeralKey(userId);
    return {
      setup_intent_secret: setupIntent.client_secret,
      ephemeral_key_secret: ephemeralKey.secret,
      customer_id: company.stripeCustomerId,
    };
  }

  /**
   * Check if company has completed legal documents.
   */
  @ApiOperation({ summary: 'Check if legal documents are completed' })
  @UseGuards(AuthGuard)
  @Get('legal-documents/completed')
  async hasCompletedLegalDocuments(@IdFromJWT() userId: number): Promise<any> {
    const hasCompleted =
      await this.companyService.hasCompletedDocuments(userId);
    return { has_completed: hasCompleted };
  }

  /**
   * Check if company has completed Stripe onboarding.
   */
  @ApiOperation({ summary: 'Check if Stripe onboarding is completed' })
  @UseGuards(AuthGuard)
  @Get('payments/completed')
  async hasCompletedStripe(@IdFromJWT() userId: number): Promise<any> {
    const hasCompleted = await this.companyService.hasCompletedStripe(userId);
    return { has_completed: hasCompleted };
  }

  /**
   * Get Stripe billing portal session link.
   */
  @UseGuards(AuthGuard)
  @Get('payments/billing-portal')
  async getAccountSettingsLink(@IdFromJWT() userId: number) {
    const url = await this.companyService.createBillingPortalSession(userId);
    return { url };
  }

  /**
   * Create a new collaboration.
   */
  @ApiOperation({ summary: 'Create collaboration' })
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateCollaborationDto })
  @Post('collaborations')
  async createCollaboration(
    @Body() dto: CreateCollaborationDto,
    @IdFromJWT() userId: number,
  ): Promise<CollaborationDto> {
    const company = await this.companyService.getCompany(userId);
    const collab = await this.collaborationService.createCollaboration(
      dto,
      company.id,
    );
    return CollaborationDto.fromEntity(collab);
  }

  /**
   * Create a draft collaboration.
   */
  @ApiOperation({ summary: 'Create draft collaboration' })
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateCollaborationDto })
  @Post('collaborations/drafts')
  async createDraftCollaboration(
    @Body() dto: CreateCollaborationDto,
    @IdFromJWT() userId: number,
  ): Promise<CollaborationDto> {
    const company = await this.companyService.getCompany(userId);
    const collab = await this.collaborationService.createDraftCollaboration(
      dto,
      company.id,
    );
    return CollaborationDto.fromEntity(collab);
  }

  /**
   * Get summaries of collaborations for authenticated company.
   */
  @UseGuards(AuthGuard)
  @Get('collaborations/summaries')
  async getCollaborationSummaries(
    @IdFromJWT() userId: number,
  ): Promise<CollaborationSummaryDto[]> {
    const company = await this.companyService.getCompany(userId);
    const summaries = await this.collaborationService.getSummariesByCompany(
      company.id,
    );
    return CollaborationSummaryDto.fromEntities(summaries);
  }

  /**
   * Get influencers the company has collaborated with.
   */
  @UseGuards(AuthGuard)
  @Get('collaborations/collaborated-influencers')
  async getCollaboratedInfluencers(
    @IdFromJWT() userId: number,
  ): Promise<InfluencerSummaryDto[]> {
    const r =
      await this.collaborationService.getCollaboratedInfluencers(userId);
    return InfluencerSummaryDto.fromEntities(r);
  }

  /**
   * Get all collaborations for authenticated company.
   */
  @ApiOperation({ summary: 'Get all collaborations' })
  @UseGuards(AuthGuard)
  @Get('collaborations')
  async getCompanyCollaborations(
    @IdFromJWT() userId: number,
  ): Promise<CollaborationDto[]> {
    const collabs =
      await this.collaborationService.getCollaborationsByCompany(userId);
    return CollaborationDto.fromEntities(collabs);
  }

  /**
   * Upload or replace files linked to a collaboration.
   */
  @ApiOperation({ summary: 'Upload collaboration files' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('collaborations/:id/files')
  async uploadCollaborationFiles(
    @Param('id') collaborationId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ files: string[] }> {
    const uploaded = await this.collaborationService.uploadCollaborationFiles(
      collaborationId,
      files,
    );
    return { files: uploaded };
  }

  /**
   * Stream a collaboration file by filename.
   */
  @ApiOperation({ summary: 'Stream collaboration file' })
  @ApiResponse({ status: 200, description: 'Returns a file stream' })
  @UseGuards(AuthGuard)
  @Get('collaborations/files/:filename')
  async getCollaborationFile(
    @Param('filename') filename: string,
  ): Promise<StreamableFile> {
    const file = await this.minioService.getFile(
      BucketType.collaborations,
      filename,
    );
    return new StreamableFile(file);
  }

  /**
   * Cancel a collaboration.
   */
  @UseGuards(AuthGuard)
  @Post('collaborations/:id/cancel')
  async cancelCollaboration(
    @Param('id') collaborationId: number,
  ): Promise<void> {
    await this.collaborationService.cancelCollaboration(collaborationId);
  }

  /**
   * Send a draft collaboration.
   */
  @UseGuards(AuthGuard)
  @Post('collaborations/:id/send-draft')
  async sendDraftCollaboration(
    @Param('id') collaborationId: number,
  ): Promise<void> {
    await this.collaborationService.sendDraftCollaboration(collaborationId);
  }

  /**
   * Supply collaboration payment intent.
   */
  @UseGuards(AuthGuard)
  @Post('collaborations/:id/supply')
  async supplyCollaboration(
    @Param('id') collaborationId: number,
    @IdFromJWT() userId: number,
  ): Promise<any> {
    const cs = await this.collaborationService.supplyCollaboration(
      userId,
      collaborationId,
    );
    return { client_secret: cs.clientSecret, ephemeral_key: cs.ephemeralKey };
  }

  /**
   * Mark a collaboration as supplied (called by Stripe webhook).
   */
  @Post('collaborations/supplied')
  async collaborationSupplied(@Body() body: any): Promise<any> {
    const transferGroup = (body as any)?.data?.object?.transfer_group ?? null;
    const collaborationId = transferGroup?.split('_')[1];
    await this.collaborationService.collaborationSupplied(collaborationId);
  }

  /**
   * Validate a collaboration.
   */
  @UseGuards(AuthGuard)
  @Post('collaborations/:id/validate')
  async validateCollaboration(
    @Param('id') collaborationId: number,
  ): Promise<any> {
    await this.collaborationService.validateCollaboration(collaborationId);
  }

  /**
   * Get collaboration by ID.
   */
  @ApiOperation({ summary: 'Get collaboration by ID' })
  @UseGuards(AuthGuard)
  @Get('collaborations/:id')
  async getCollaboration(@Param('id') id: number): Promise<CollaborationDto> {
    const collab = await this.collaborationService.getCollaboration(id);
    return CollaborationDto.fromEntity(collab);
  }

  /**
   * Create a review for a collaboration.
   */
  @UseGuards(AuthGuard)
  @Post('reviews')
  async createReview(
    @Body() body: CreateReviewDto,
    @IdFromJWT() userId,
  ): Promise<any> {
    await this.collaborationService.createReview(
      body.collaboration_id,
      userId,
      body.reviewed_id,
      body.stars,
      body.description,
    );
  }

  /**
   * Get a specific review.
   */
  @UseGuards(AuthGuard)
  @Get('reviews/:collaboration_id/:author_id/:reviewed_id')
  async getReview(
    @Param('collaboration_id') collaborationId: number,
    @Param('author_id') authorId: number,
    @Param('reviewed_id') reviewedId: number,
  ): Promise<any> {
    const r = await this.collaborationService.getReview(
      collaborationId,
      authorId,
      reviewedId,
    );
    if (r === null) {
      return { review: null };
    }
    return { review: ReviewDto.fromEntity(r) };
  }

  /**
   * Get reviews written by a specific author.
   */
  @UseGuards(AuthGuard)
  @Get('reviews/author/:author_id')
  async getReviewsByAuthor(
    @Param('author_id') authorId: number,
  ): Promise<ReviewDto[]> {
    const r = await this.collaborationService.getReviewsByAuthor(authorId);
    return ReviewDto.fromEntities(r);
  }

  /**
   * Get reviews received by a specific user.
   */
  @UseGuards(AuthGuard)
  @Get('reviews/reviewed/:reviewed_id')
  async getReviewsByReviewed(
    @Param('reviewed_id') reviewedId: number,
  ): Promise<ReviewDto[]> {
    const r = await this.collaborationService.getReviewsByReviewed(reviewedId);
    return ReviewDto.fromEntities(r);
  }

  /**
   * Get platform quote for a collaboration.
   */
  @UseGuards(AuthGuard)
  @Get('collaborations/:id/platform-quote')
  async getPlatformQuote(
    @Param('id') collaborationId: number,
  ): Promise<StreamableFile> {
    const f = await this.collaborationService.getPlatformQuote(collaborationId);
    return new StreamableFile(f);
  }

  /**
   * Get platform invoice for a collaboration.
   */
  @UseGuards(AuthGuard)
  @Get('collaborations/:id/platform-invoice')
  async getPlatformInvoice(
    @Param('id') collaborationId: number,
  ): Promise<StreamableFile> {
    const f =
      await this.collaborationService.getPlatformInvoice(collaborationId);
    return new StreamableFile(f);
  }

  /**
   * Get influencer quote for a collaboration.
   */
  @UseGuards(AuthGuard)
  @Get('collaborations/:id/influencer-quote')
  async getInfluencerQuote(
    @Param('id') collaborationId: number,
  ): Promise<StreamableFile> {
    const f =
      await this.collaborationService.getInfluencerQuote(collaborationId);
    return new StreamableFile(f);
  }

  /**
   * Get influencer invoice for a collaboration.
   */
  @UseGuards(AuthGuard)
  @Get('collaborations/:id/influencer-invoice')
  async getInfluencerInvoice(
    @Param('id') collaborationId: number,
  ): Promise<StreamableFile> {
    const f =
      await this.collaborationService.getInfluencerInvoice(collaborationId);
    return new StreamableFile(f);
  }

  /**
   * Get review summaries for authenticated company.
   */
  @UseGuards(AuthGuard)
  @Get('reviews/summaries')
  async getReviewSummaries(
    @IdFromJWT() userId: number,
  ): Promise<ReviewSummaryDto[]> {
    const r = await this.collaborationService.getCompanyReviewSummaries(userId);
    return ReviewSummaryDto.fromEntities(r);
  }

  /**
   * Get review summaries for an influencer.
   */
  @UseGuards(AuthGuard)
  @Get('influencers/:id/review-summaries')
  async getInfluencerReviewSummaries(
    @Param('id') userId: number,
  ): Promise<ReviewSummaryDto[]> {
    const r =
      await this.collaborationService.getInfluencerReviewSummaries(userId);
    return ReviewSummaryDto.fromEntities(r);
  }

  /**
   * Get companies an influencer has collaborated with.
   */
  @UseGuards(AuthGuard)
  @Get('influencers/:id/collaborated-companies')
  async getInfluencerCollaboratedCompanies(
    @Param('id') userId: number,
  ): Promise<CollaboratedCompanyDto[]> {
    const r = await this.collaborationService.getCollaboratedCompanies(userId);
    return CollaboratedCompanyDto.fromEntities(r);
  }

  /**
   * Check if company has an Instagram account linked.
   */
  @ApiOperation({ summary: 'Check if Instagram account is linked' })
  @UseGuards(AuthGuard)
  @Get('social/instagram/has-account')
  async hasInstagramAccount(@IdFromJWT() userId: number): Promise<any> {
    const hasInstagramAccount =
      await this.facebookService.hasInstagramAccount(userId);
    return { has_instagram_account: hasInstagramAccount };
  }

  /**
   * Get Instagram account details of company.
   */
  @ApiOperation({ summary: 'Get Instagram account' })
  @UseGuards(AuthGuard)
  @Get('social/instagram')
  async getInstagramAccount(
    @IdFromJWT() userId: number,
  ): Promise<InstagramAccountDto> {
    await this.facebookService.refreshInstagramStatistics(userId);
    const instagramAccount =
      await this.facebookService.getInstagramAccount(userId);
    return InstagramAccountDto.fromEntity(instagramAccount);
  }

  /**
   * Link a fetched Instagram account to company.
   */
  @ApiOperation({ summary: 'Link fetched Instagram account' })
  @UseGuards(AuthGuard)
  @Get('social/instagram/:fetched_account_id')
  async createInstagramAccount(
    @IdFromJWT() userId: number,
    @Param('fetched_account_id') fetchedInstagramAccountId: string,
  ): Promise<void> {
    await this.facebookService.createInstagramAccount(
      userId,
      fetchedInstagramAccountId,
    );
  }

  /**
   * Get company profile completion status.
   */
  @ApiOperation({ summary: 'Get profile completion status' })
  @UseGuards(AuthGuard)
  @Get('profile/completion-status')
  async getProfileCompletionStatus(
    @IdFromJWT() userId: number,
  ): Promise<CompanyProfileCompletionStatusDto> {
    const e = await this.companyService.getProfileCompletionStatus(userId);
    return CompanyProfileCompletionStatusDto.fromEntity(e);
  }

  /**
   * Check if company profile is completed.
   */
  @ApiOperation({ summary: 'Check if profile is completed' })
  @UseGuards(AuthGuard)
  @Get('profile/completed')
  async hasCompletedProfile(@IdFromJWT() userId: number): Promise<any> {
    const hasCompletedProfile =
      await this.companyService.hasCompletedProfile(userId);
    return { has_completed_profile: hasCompletedProfile };
  }

  /**
   * Get authenticated company details.
   */
  @ApiOperation({ summary: 'Get company details' })
  @UseGuards(AuthGuard)
  @Get()
  async getCompany(@IdFromJWT() userId: number): Promise<CompanyDto> {
    const company = await this.companyService.getCompany(userId);
    const socialNetworks = await this.companyService.getSocialNetworks(userId);
    return CompanyDto.fromEntity(company, socialNetworks);
  }

  /**
   * Search influencers by theme.
   */
  @ApiOperation({ summary: 'Search influencers by theme' })
  @UseGuards(AuthGuard)
  @Post('influencers/search-by-theme')
  async searchInfluencersByTheme(
    @Body() dto: SearchInfluencersByThemeDto,
  ): Promise<InfluencerSummaryDto[]> {
    const influencers = await this.companyService.searchInfluencersByTheme(
      dto.theme,
    );
    return influencers.map(InfluencerSummaryDto.fromEntity);
  }

  /**
   * Search influencers by filters.
   */
  @ApiOperation({ summary: 'Search influencers by filters' })
  @UseGuards(AuthGuard)
  @Post('influencers/search-by-filters')
  async searchInfluencersByFilters(
    @Body() dto: SearchInfluencersByFiltersDto,
  ): Promise<InfluencerSummaryDto[]> {
    const influencers =
      await this.companyService.searchInfluencersByFilters(dto);
    return influencers.map(InfluencerSummaryDto.fromEntity);
  }

  /**
   * Get detailed influencer profile.
   */
  @ApiOperation({ summary: 'Get influencer profile' })
  @UseGuards(AuthGuard)
  @Get('influencers/:id')
  async getInfluencer(@Param('id') influencerUserId: number): Promise<any> {
    const influencer =
      await this.influencerService.getInfluencer(influencerUserId);
    const socialNetworks =
      await this.influencerService.getSocialNetworks(influencerUserId);
    await this.influencerService.incrementProfileViews(influencerUserId);
    return InfluencerDto.fromEntity(influencer, socialNetworks);
  }

  /**
   * Get influencer Instagram statistics.
   */
  @ApiOperation({ summary: 'Get influencer Instagram statistics' })
  @UseGuards(AuthGuard)
  @Get('influencers/:id/instagram-statistics')
  async getInfluencerInstagramStatistics(
    @Param('id') userId: number,
  ): Promise<any> {
    await this.facebookService.refreshInstagramStatistics(userId);
    const instagramAccount =
      await this.facebookService.getInstagramAccount(userId);
    return InstagramAccountDto.fromEntity(instagramAccount);
  }

  /**
   * Calculate product placement price for influencer.
   */
  @UseGuards(AuthGuard)
  @Get('influencers/:id/product-placement-price/:type')
  async calculateProductPlacementPrice(
    @Param('id') userId: number,
    @Param('type') productPlacementType: string,
  ): Promise<any> {
    const price =
      await this.priceAlgorithmService.calculateProductPlacementPrice(
        userId,
        productPlacementType as ProductPlacementType,
      );
    return { price };
  }

  /**
   * Get influencer profile completion status.
   */
  @ApiOperation({ summary: 'Get influencer profile completion status' })
  @UseGuards(AuthGuard)
  @Get('influencers/:id/completion-status')
  async getCompletionStatus(@Param('id') userId: number): Promise<any> {
    const e = await this.influencerService.getProfileCompletionStatus(userId);
    return InfluencerProfileCompletionStatusDto.fromEntity(e);
  }

  /**
   * Get all conversations of the company.
   */
  @UseGuards(AuthGuard)
  @Get('conversations')
  async getAllConversations(
    @IdFromJWT() userId: number,
  ): Promise<ConversationSummaryDto[]> {
    const company = await this.companyService.getCompany(userId);
    const r = await this.conversationService.getConversations(company.id);
    return ConversationSummaryDto.fromEntities(r);
  }

  /**
   * Get messages from a conversation.
   */
  @UseGuards(AuthGuard)
  @Get('conversations/:id/messages')
  async getMessagesByConversationId(
    @Param('id') conversationId: number,
  ): Promise<MessageDto[]> {
    const r =
      await this.conversationService.getMessagesByConversationId(
        conversationId,
      );
    return MessageDto.fromEntities(r);
  }

  /**
   * Mark all messages of a conversation as read.
   */
  @UseGuards(AuthGuard)
  @Post('conversations/:id/mark-as-read')
  async markConversationMessagesAsRead(
    @Param('id') conversationId: number,
  ): Promise<void> {
    await this.conversationService.markConversationMessagesAsRead(
      conversationId,
      'company',
    );
  }

  /**
   * Add a message to a conversation.
   */
  @UseGuards(AuthGuard)
  @Post('conversations/:id/messages')
  async addMessage(
    @IdFromJWT() userId: number,
    @Body() dto: AddMessageDto,
  ): Promise<void> {
    const company = await this.companyService.getCompany(userId);
    await this.conversationService.addMessage(
      dto.conversation_id,
      'company',
      company.id,
      dto.content,
    );
  }

  /**
   * Get notification preferences of company.
   */
  @UseGuards(AuthGuard)
  @Get('notifications/preferences')
  async getPreferences(
    @IdFromJWT() userId: number,
  ): Promise<UserNotificationPreferenceDto[]> {
    const entities =
      await this.notificationService.getPreferencesByUserId(userId);
    return UserNotificationPreferenceDto.fromEntities(entities);
  }

  /**
   * Update notification preference.
   */
  @UseGuards(AuthGuard)
  @Put('notifications/preferences')
  async updatePreference(
    @IdFromJWT() userId: number,
    @Body() dto: UpdateUserNotificationPreferenceDto,
  ): Promise<void> {
    await this.notificationService.updateUserPreference(
      userId,
      dto.type,
      dto.enabled,
    );
  }
}
