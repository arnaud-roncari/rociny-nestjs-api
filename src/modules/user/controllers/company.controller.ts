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
import { InfluencerSummary } from '../entities/influencer_summary.entity';
import { SearchInfluencersByThemeDto } from '../dtos/search-influencers-by-theme.dto';
import { InfluencerSummaryDto } from '../dtos/influencer-summary.dto';
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
import { CollaboratedCompanyEntity } from '../entities/collaborated_company_entity';
import { CollaboratedCompanyDto } from '../dtos/collaborated_company.dto';
import { ConversationSummaryDto } from 'src/modules/conversation/dtos/conversation.dto';
import { ConversationService } from 'src/modules/conversation/conversation.service';
import { MessageDto } from 'src/modules/conversation/dtos/message.dto';
import { AddMessageDto } from 'src/modules/conversation/dtos/add-message.dto';

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
  ) {}

  /**
   * Updates the profile picture of the currently authenticated user.
   *
   * @param file - The uploaded file containing the new profile picture.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves to an instance of `UpdatedProfilePictureDto` containing the URL of the updated profile picture.
   *
   */
  @ApiOperation({ summary: 'Update user profile picture' })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @Put('update-profile-picture')
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @IdFromJWT() userId: number,
  ): Promise<ProfilePictureUpdatedDto> {
    const newProfilePicture: string =
      await this.companyService.updateProfilePicture(userId, file);
    return new ProfilePictureUpdatedDto(newProfilePicture);
  }

  /**
   * Streams the profile picture of the currently authenticated user.
   *
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A stream of the user's profile picture.
   */
  @ApiOperation({ summary: 'Stream user profile picture' })
  @UseGuards(AuthGuard)
  @Get('get-profile-picture')
  async getProfilePicture(
    @IdFromJWT() userId: number,
  ): Promise<StreamableFile> {
    const stream = await this.companyService.getProfilePicture(userId);
    return new StreamableFile(stream);
  }

  @ApiOperation({ summary: 'Stream user profile picture' })
  @Get('get-profile-picture/:filename')
  async getProfilePicturebyFilename(
    @Param('filename') filename: string,
  ): Promise<StreamableFile> {
    const stream =
      await this.companyService.getProfilePictureByFilename(filename);
    return new StreamableFile(stream);
  }

  @Get('get-influencer-profile-picture/:filename')
  async getInfluencerProfilePicture(
    @Param('filename') filename: string,
  ): Promise<StreamableFile> {
    const stream =
      await this.companyService.getInfluencerProfilePicture(filename);
    return new StreamableFile(stream);
  }

  /**
   * Updates the name of the currently authenticated user.
   *
   * @param name - The new name to update.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves when the name is successfully updated.
   */
  @ApiOperation({ summary: 'Update user name' })
  @UseGuards(AuthGuard)
  @Put('update-name')
  async updateName(
    @IdFromJWT() userId: number,
    @Body() body: UpdateNameDto,
  ): Promise<void> {
    await this.companyService.updateName(userId, body.name);
  }

  @UseGuards(AuthGuard)
  @Put('update-trade-name')
  async updateTradeName(
    @IdFromJWT() userId: number,
    @Body() body: UpdateTradeNameDto,
  ): Promise<void> {
    await this.companyService.updateTradeName(userId, body.trade_name);
  }

  @UseGuards(AuthGuard)
  @Put('update-vat-number')
  async updateVATNumber(
    @IdFromJWT() userId: number,
    @Body() body: UpdateVATNumberDto,
  ): Promise<void> {
    await this.companyService.updateVATNumber(userId, body.vat_number);
  }

  @UseGuards(AuthGuard)
  @Put('update-billing-address')
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
   * Updates the description of the currently authenticated user.
   *
   * @param description - The new description to update.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves when the description is successfully updated.
   */
  @ApiOperation({ summary: 'Update user description' })
  @UseGuards(AuthGuard)
  @Put('update-description')
  async updateDescription(
    @IdFromJWT() userId: number,
    @Body() body: UpdateDescriptionDto,
  ): Promise<void> {
    await this.companyService.updateDescription(userId, body.description);
  }

  /**
   * Updates the department of the currently authenticated user.
   *
   * @param department - The new department to update.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves when the department is successfully updated.
   */
  @ApiOperation({ summary: 'Update user department' })
  @UseGuards(AuthGuard)
  @Put('update-department')
  async updateDepartment(
    @IdFromJWT() userId: number,
    @Body() body: UpdateDepartmentDto,
  ): Promise<void> {
    await this.companyService.updateDepartment(userId, body.department);
  }

  /**
   * Adds a social network to the user's profile.
   *
   * @param body - The details of the social network to add.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves when the social network is successfully added.
   */
  @ApiOperation({ summary: 'Add a social network to user profile' })
  @UseGuards(AuthGuard)
  @Post('add-social-network')
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
   * Retrieves the social networks of the currently authenticated user.
   *
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves to the list of social networks.
   */
  @ApiOperation({ summary: 'Get user social networks' })
  @UseGuards(AuthGuard)
  @Get('get-social-networks')
  async getSocialNetworks(
    @IdFromJWT() userId: number,
  ): Promise<SocialNetworkDto[]> {
    const sn = await this.companyService.getSocialNetworks(userId);
    return SocialNetworkDto.fromEntities(sn);
  }

  /**
   * Deletes a social network from the user's profile.
   *
   * @param userId - The ID of the user extracted from the JWT token.
   * @param socialNetworkId - The ID of the social network to delete.
   * @returns A promise that resolves when the social network is successfully deleted.
   */
  @ApiOperation({ summary: 'Delete a social network from user profile' })
  @UseGuards(AuthGuard)
  @Delete('delete-social-network/:id')
  async deleteSocialNetwork(
    @IdFromJWT() userId: number,
    @Param('id') socialNetworkId: string,
  ): Promise<void> {
    await this.companyService.deleteSocialNetwork(userId, socialNetworkId);
  }

  /**
   * Updates a social network in the user's profile.
   *
   * @param userId - The ID of the user extracted from the JWT token.
   * @param socialNetworkId - The ID of the social network to update.
   * @param body - The new details of the social network.
   * @returns A promise that resolves when the social network is successfully updated.
   */
  @ApiOperation({ summary: 'Update a social network in user profile' })
  @UseGuards(AuthGuard)
  @Put('update-social-network')
  async updateSocialNetwork(
    @IdFromJWT() userId: number,
    @Body() body: UpdateSocialNetworkDto,
  ): Promise<void> {
    await this.companyService.updateSocialNetwork(userId, body.id, body.url);
  }

  /**
   * Adds a new legal document for the user.
   *
   * @param userId - The ID of the user extracted from the JWT token.
   * @param type - The type of the legal document to be added.
   * @param file - The file to be uploaded as the legal document.
   * @returns A promise that resolves when the document is successfully added.
   */
  @ApiOperation({ summary: 'Add a new legal document for the user' })
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('add-legal-document/:type')
  async addLegalDocument(
    @IdFromJWT() userId: number,
    @Param('type') type: LegalDocumentType,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    await this.companyService.addLegalDocument(userId, type, file);
  }

  /**
   * Deletes a legal document of the user based on the document type.
   *
   * @param userId - The ID of the user extracted from the JWT token.
   * @param type - The type of the legal document to be deleted.
   * @returns A promise that resolves when the document is successfully deleted.
   */
  @ApiOperation({ summary: 'Delete a legal document for the user' })
  @UseGuards(AuthGuard)
  @Delete('delete-legal-document/:type')
  async deleteLegalDocument(
    @Param('type') type: LegalDocumentType,
    @IdFromJWT() userId: number,
  ): Promise<void> {
    await this.companyService.deleteLegalDocument(userId, type);
  }

  /**
   * Retrieves the status of a specific legal document for the user.
   *
   * @param userId - The ID of the user extracted from the JWT token.
   * @param type - The type of the legal document to check the status for.
   * @returns The status of the legal document.
   */
  @ApiOperation({ summary: 'Get the status of a legal document for the user' })
  @UseGuards(AuthGuard)
  @Get('get-legal-document-status/:type')
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
   * Creates a SetupIntent for the company associated with the user ID.
   * This is used to allow the user to save a payment method for future use.
   *
   * @param userId - The ID of the user (company) requesting the SetupIntent. This is retrieved from the JWT token via the `@IdFromJWT` decorator.
   * @returns A promise that resolves with an object containing the ID of the created SetupIntent.
   *          This ID will be used on the frontend to complete the setup flow via Stripe.
   */
  @UseGuards(AuthGuard)
  @Get('create-setup-intent')
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

  @ApiOperation({ summary: 'Check if influencer completed legal documents' })
  @UseGuards(AuthGuard)
  @Get('has-completed/legal-documents')
  async hasCompletedLegalDocuments(@IdFromJWT() userId: number): Promise<any> {
    const hasCompleted =
      await this.companyService.hasCompletedDocuments(userId);
    return { has_completed: hasCompleted };
  }

  @ApiOperation({ summary: 'Check if influencer completed Stripe onboarding' })
  @UseGuards(AuthGuard)
  @Get('has-completed/stripe')
  async hasCompletedStripe(@IdFromJWT() userId: number): Promise<any> {
    const hasCompleted = await this.companyService.hasCompletedStripe(userId);
    return { has_completed: hasCompleted };
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @Get('stripe/billing-portal-session')
  async getAccountSettingsLink(@IdFromJWT() userId: number) {
    const url = await this.companyService.createBillingPortalSession(userId);
    return { url };
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Get('has-instagram-account')
  async hasInstagramAccount(@IdFromJWT() userId: number): Promise<any> {
    const hasInstagramAccount =
      await this.facebookService.hasInstagramAccount(userId);
    return { has_instagram_account: hasInstagramAccount };
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Get('instagram')
  async getInstagramAccount(
    @IdFromJWT() userId: number,
  ): Promise<InstagramAccountDto> {
    await this.facebookService.refreshInstagramStatistics(userId);
    const instagramAccount =
      await this.facebookService.getInstagramAccount(userId);
    return InstagramAccountDto.fromEntity(instagramAccount);
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Get('instagram/:fetched_instagram_account_id')
  async createInstagramAccount(
    @IdFromJWT() userId: number,
    @Param('fetched_instagram_account_id') fetchedInstagramAccountId: string,
  ): Promise<void> {
    await this.facebookService.createInstagramAccount(
      userId,
      fetchedInstagramAccountId,
    );
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Get('get-profile-completion-status')
  async getProfileCompletionStatus(
    @IdFromJWT() userId: number,
  ): Promise<CompanyProfileCompletionStatusDto> {
    let e = await this.companyService.getProfileCompletionStatus(userId);
    return CompanyProfileCompletionStatusDto.fromEntity(e);
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Get('has-completed-profile')
  async hasCompletedProfile(@IdFromJWT() userId: number): Promise<any> {
    let hasCompletedProfile =
      await this.companyService.hasCompletedProfile(userId);
    return { has_completed_profile: hasCompletedProfile };
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Get()
  async getCompany(@IdFromJWT() userId: number): Promise<CompanyDto> {
    let company = await this.companyService.getCompany(userId);
    let socialNetworks = await this.companyService.getSocialNetworks(userId);
    /// Add statistics
    return CompanyDto.fromEntity(company, socialNetworks);
  }

  @ApiOperation({ summary: 'Get influencers by theme' })
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, type: [InfluencerSummaryDto] })
  @Post('search-influencers-by-theme')
  async searchInfluencersByTheme(
    @Body() dto: SearchInfluencersByThemeDto,
  ): Promise<InfluencerSummaryDto[]> {
    const influencers = await this.companyService.searchInfluencersByTheme(
      dto.theme,
    );
    return influencers.map(InfluencerSummaryDto.fromEntity);
  }

  @ApiOperation({ summary: 'Get influencers by filters' })
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, type: [InfluencerSummaryDto] })
  @Post('search-influencers-by-filters')
  async searchInfluencersByFilters(
    @Body() dto: SearchInfluencersByFiltersDto,
  ): Promise<InfluencerSummaryDto[]> {
    const influencers =
      await this.companyService.searchInfluencersByFilters(dto);
    return influencers.map(InfluencerSummaryDto.fromEntity);
  }

  @ApiOperation({ summary: '' })
  @UseGuards(AuthGuard)
  @Get('get-influencer/:influencer_user_id')
  async getInfluencer(
    @Param('influencer_user_id') influencerUserId: number,
  ): Promise<any> {
    let influencer =
      await this.influencerService.getInfluencer(influencerUserId);
    let socialNetworks =
      await this.influencerService.getSocialNetworks(influencerUserId);
    await this.influencerService.incrementProfileViews(influencerUserId);
    return InfluencerDto.fromEntity(influencer, socialNetworks);
  }

  @ApiOperation({ summary: '' })
  @UseGuards(AuthGuard)
  @Get('get-influencer-instagram-statistics/:user_id')
  async getInfluencerInstagramStatistics(
    @Param('user_id') userId: number,
  ): Promise<any> {
    await this.facebookService.refreshInstagramStatistics(userId);
    const instagramAccount =
      await this.facebookService.getInstagramAccount(userId);
    return InstagramAccountDto.fromEntity(instagramAccount);
  }

  @UseGuards(AuthGuard)
  @Get('calculate-product-placement-price/:user_id/:product_placement_type')
  async calculateProductPlacementPrice(
    @Param('user_id') userId: number,
    @Param('product_placement_type') productPlacementType: string,
  ): Promise<any> {
    const price =
      await this.priceAlgorithmService.calculateProductPlacementPrice(
        userId,
        productPlacementType as ProductPlacementType,
      );
    return { price };
  }

  @ApiOperation({ summary: '' })
  @UseGuards(AuthGuard)
  @Get('get-influencer-completion-status/:user_id')
  async getCompletionStatus(@Param('user_id') userId: number): Promise<any> {
    let e = await this.influencerService.getProfileCompletionStatus(userId);
    return InfluencerProfileCompletionStatusDto.fromEntity(e);
  }

  @ApiOperation({ summary: 'Create a new collaboration' })
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateCollaborationDto })
  @Post('create-collaboration')
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

  @ApiOperation({ summary: 'Create a new collaboration (draft)' })
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateCollaborationDto })
  @Post('create-draft-collaboration')
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

  @ApiOperation({ summary: 'Get collaboration by ID' })
  @UseGuards(AuthGuard)
  @Get('get-collaboration/:id')
  async getCollaboration(@Param('id') id: number): Promise<CollaborationDto> {
    const collab = await this.collaborationService.getCollaboration(id);
    return CollaborationDto.fromEntity(collab);
  }

  @UseGuards(AuthGuard)
  @Get('get-collaboration-summaries')
  async getCollaborationSummaries(
    @IdFromJWT() userId: number,
  ): Promise<CollaborationSummaryDto[]> {
    const company = await this.companyService.getCompany(userId);
    const summaries = await this.collaborationService.getSummariesByCompany(
      company.id,
    );
    return CollaborationSummaryDto.fromEntities(summaries);
  }

  @ApiOperation({ summary: 'Get all collaborations for the company' })
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
   * Uploads multiple files for a specific collaboration.
   * This will replace any existing files linked to the collaboration.
   *
   * @param collabId - The ID of the collaboration to update.
   * @param files - Array of uploaded files.
   * @returns List of uploaded file URLs.
   */
  @ApiOperation({ summary: 'Upload collaboration files (replace files[])' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('upload-collaboration-files/:collaboration_id')
  async uploadCollaborationFiles(
    @Param('collaboration_id') collaborationId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ files: string[] }> {
    const uploaded = await this.collaborationService.uploadCollaborationFiles(
      collaborationId,
      files,
    );
    return { files: uploaded };
  }

  @ApiOperation({ summary: 'Stream a collaboration file by filename' })
  @ApiResponse({ status: 200, description: 'Returns a file stream' })
  @UseGuards(AuthGuard)
  @Get('collaboration-file/:filename')
  async getCollaborationFile(
    @Param('filename') filename: string,
  ): Promise<StreamableFile> {
    const file = await this.minioService.getFile(
      BucketType.collaborations,
      filename,
    );
    return new StreamableFile(file);
  }

  @UseGuards(AuthGuard)
  @Get('collaboration/cancel/:collaboration_id')
  async cancelCollaboration(
    @Param('collaboration_id') collaborationId: number,
  ): Promise<void> {
    await this.collaborationService.cancelCollaboration(collaborationId);
  }

  @UseGuards(AuthGuard)
  @Get('send-draft-collaboration/:collaboration_id')
  async sendDraftCollaboration(
    @Param('collaboration_id') collaborationId: number,
  ): Promise<void> {
    await this.collaborationService.sendDraftCollaboration(collaborationId);
  }

  @UseGuards(AuthGuard)
  @Get('supply-collaboration/:collaboration_id')
  async supplyCollaboration(
    @Param('collaboration_id') collaborationId: number,
    @IdFromJWT() userId: number,
  ): Promise<any> {
    let cs = await this.collaborationService.supplyCollaboration(
      userId,
      collaborationId,
    );
    return { client_secret: cs.clientSecret, ephemeral_key: cs.ephemeralKey };
  }

  @Post('collaboration-supplied')
  async collaborationSupplied(@Body() body: any): Promise<any> {
    /// Extract collaboration id
    const transferGroup = (body as any)?.data?.object?.transfer_group ?? null;
    const collaborationId = transferGroup?.split('_')[1];
    await this.collaborationService.collaborationSupplied(collaborationId);
  }

  @UseGuards(AuthGuard)
  @Get('validate-collaboration/:collaboration_id')
  async validateCollaboration(
    @Param('collaboration_id') collaborationId: number,
  ): Promise<any> {
    await this.collaborationService.validateCollaboration(collaborationId);
  }

  @UseGuards(AuthGuard)
  @Post('create-review')
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

  @UseGuards(AuthGuard)
  @Get('get-review/:collaboration_id/:author_id/:reviewed_id')
  async getReview(
    @Param('collaboration_id') collaborationId: number,
    @Param('author_id') authorId: number,
    @Param('reviewed_id') reviewedId: number,
  ): Promise<any> {
    let r = await this.collaborationService.getReview(
      collaborationId,
      authorId,
      reviewedId,
    );

    if (r === null) {
      return { review: null };
    }

    return { review: ReviewDto.fromEntity(r) };
  }

  @UseGuards(AuthGuard)
  @Get('get-reviews/author/:author_id')
  async getReviewsByAuthor(
    @Param('author_id') authorId: number,
  ): Promise<ReviewDto[]> {
    let r = await this.collaborationService.getReviewsByAuthor(authorId);
    return ReviewDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-reviews/reviewed/:reviewed_id')
  async getReviewsByReviewed(
    @Param('reviewed_id') reviewedId: number,
  ): Promise<ReviewDto[]> {
    let r = await this.collaborationService.getReviewsByReviewed(reviewedId);
    return ReviewDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-platform-quote/:collaboration_id')
  async getPlatformQuote(
    @Param('collaboration_id') collaborationId: number,
  ): Promise<StreamableFile> {
    let f = await this.collaborationService.getPlatformQuote(collaborationId);
    return new StreamableFile(f);
  }

  @UseGuards(AuthGuard)
  @Get('get-platform-invoice/:collaboration_id')
  async getPlatformInvoice(
    @Param('collaboration_id') collaborationId: number,
  ): Promise<StreamableFile> {
    let f = await this.collaborationService.getPlatformInvoice(collaborationId);
    return new StreamableFile(f);
  }

  @UseGuards(AuthGuard)
  @Get('get-influencer-quote/:collaboration_id')
  async getInfluencerQuote(
    @Param('collaboration_id') collaborationId: number,
  ): Promise<StreamableFile> {
    let f = await this.collaborationService.getInfluencerQuote(collaborationId);
    return new StreamableFile(f);
  }

  @UseGuards(AuthGuard)
  @Get('get-influencer-invoice/:collaboration_id')
  async getInfluencerInvoice(
    @Param('collaboration_id') collaborationId: number,
  ): Promise<StreamableFile> {
    let f =
      await this.collaborationService.getInfluencerInvoice(collaborationId);
    return new StreamableFile(f);
  }

  @UseGuards(AuthGuard)
  @Get('get-review-summaries')
  async getReviewSummaries(
    @IdFromJWT() userId: number,
  ): Promise<ReviewSummaryDto[]> {
    let r = await this.collaborationService.getCompanyReviewSummaries(userId);
    return ReviewSummaryDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-influencer-review-summaries/:influencer_user_id')
  async getInfluencerReviewSummaries(
    @Param('influencer_user_id') userId: number,
  ): Promise<ReviewSummaryDto[]> {
    let r =
      await this.collaborationService.getInfluencerReviewSummaries(userId);
    return ReviewSummaryDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-influencer-collaborated-companies/:influencer_user_id')
  async getInfluencerCollaboratedCompanies(
    @Param('influencer_user_id') userId: number,
  ): Promise<CollaboratedCompanyDto[]> {
    let r = await this.collaborationService.getCollaboratedCompanies(userId);
    return CollaboratedCompanyDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-collaborated-influencers')
  async getCollaboratedInfluencers(
    @IdFromJWT() userId: number,
  ): Promise<InfluencerSummaryDto[]> {
    let r = await this.collaborationService.getCollaboratedInfluencers(userId);
    return InfluencerSummaryDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-all-conversations')
  async getAllConversations(
    @IdFromJWT() userId: number,
  ): Promise<ConversationSummaryDto[]> {
    let company = await this.companyService.getCompany(userId);
    let r = await this.conversationService.getConversations(company.id);
    return ConversationSummaryDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-messages-by-conversation/:conversation_id')
  async getMessagesByConversationId(
    @Param('conversation_id') conversationId: number,
  ): Promise<MessageDto[]> {
    let r =
      await this.conversationService.getMessagesByConversationId(
        conversationId,
      );
    return MessageDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('mark-messages-as-read/:conversation_id')
  async markConversationMessagesAsRead(
    @Param('conversation_id') conversationId: number,
  ): Promise<void> {
    let r = await this.conversationService.markConversationMessagesAsRead(
      conversationId,
      'company',
    );
  }

  @UseGuards(AuthGuard)
  @Post('add-message')
  async addMessage(
    @IdFromJWT() userId: number,
    @Body() dto: AddMessageDto,
  ): Promise<void> {
    const company = await this.companyService.getCompany(userId);

    const message = await this.conversationService.addMessage(
      dto.conversation_id,
      'company',
      company.id,
      dto.content,
    );
  }
}
