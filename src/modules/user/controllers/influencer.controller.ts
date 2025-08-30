import {
  Controller,
  Put,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  StreamableFile,
  Get,
  Param,
  UploadedFiles,
  Body,
  Post,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProfilePictureUpdatedDto } from '../dtos/profile-picture-updated.dto';
import { IdFromJWT } from 'src/commons/decorators/id-from-jwt.decorators';
import { AuthGuard } from 'src/commons/guards/auth.guard';
import { InfluencerService } from '../services/influencer.service';
import { PortfolioUpdatedDto } from '../dtos/portfolio-updated.dto';
import { UpdateNameDto } from '../dtos/update-name.dto';
import { UpdateDescriptionDto } from '../dtos/update-description.dto';
import { UpdateDepartmentDto } from '../dtos/update-department.dto';
import { UpdateThemesDto } from '../dtos/update-themes.dto';
import { UpdateTargetAudienceDto } from '../dtos/update-target-audience.dto';
import { CreateSocialNetworkDto } from '../dtos/create-social-network.dto';
import { SocialNetworkDto } from '../dtos/social-network.dto';
import { UpdateSocialNetworkDto } from '../dtos/update-social-network.dto';
import { LegalDocumentType } from 'src/commons/enums/legal_document_type';
import { InstagramAccountDto } from 'src/modules/facebook/dtos/instagram_account.dto';
import { FacebookService } from 'src/modules/facebook/facebook.service';
import { InfluencerDto } from '../dtos/influencer.dto';
import { InfluencerProfileCompletionStatusDto } from '../dtos/influencer-profile-completion-status.dto';
import { CollaborationEntity } from '../entities/collaboration.entity';
import { CollaborationService } from '../services/collaboration.service';
import { UpdateVATNumberDto } from '../dtos/update-vat-number.dto';
import { CollaborationSummaryDto } from '../dtos/collaboration-summary.dto';
import { CompanyService } from '../services/company.service';
import { MinioService } from 'src/modules/minio/minio.service';
import { BucketType } from 'src/commons/enums/bucket_type';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { ReviewDto } from '../dtos/review.dto';
import { CollaborationDto } from '../dtos/collaboration.dto';
import { CompanyDto } from '../dtos/company.dto';
import { CompanyProfileCompletionStatusDto } from '../dtos/company-profile-completion-status.dto';
import { ReviewSummaryDto } from '../dtos/review_summary.dto';
import { CollaboratedCompanyEntity } from '../entities/collaborated_company_entity';
import { CollaboratedCompanyDto } from '../dtos/collaborated_company.dto';
import { InfluencerSummary } from '../entities/influencer_summary.entity';
import { InfluencerSummaryDto } from '../dtos/influencer-summary.dto';
import { InfluencerStatisticsDto } from '../dtos/influencer_statistics.dto';
import { ConversationSummaryDto } from 'src/modules/conversation/dtos/conversation.dto';
import { ConversationService } from 'src/modules/conversation/conversation.service';
import { MessageDto } from 'src/modules/conversation/dtos/message.dto';
import { AddMessageDto } from 'src/modules/conversation/dtos/add-message.dto';
import { RegisterDeviceDto } from '../dtos/register_device.dto';
import { UserDeviceEntity } from 'src/modules/notification/entities/user_device.entity';
import { DeleteDeviceDto } from '../dtos/delete_device_dto';
import { NotificationService } from 'src/modules/notification/notification.service';
import { UserNotificationPreferenceDto } from 'src/modules/notification/dto/user_notification_preference.dto';
import { UpdateUserNotificationPreferenceDto } from 'src/modules/notification/dto/update_user_notification_preference.dto';

@Controller('influencer')
export class InfluencerController {
  constructor(
    private readonly influencerService: InfluencerService,
    private readonly companyService: CompanyService,
    private readonly minioService: MinioService,
    private readonly facebookService: FacebookService,
    private readonly collaborationService: CollaborationService,
    private readonly conversationService: ConversationService,
    private readonly notificationService: NotificationService,
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
      await this.influencerService.updateProfilePicture(userId, file);
    return new ProfilePictureUpdatedDto(newProfilePicture);
  }

  /**
   * Streams the profile picture of a user by their user ID.
   *
   * @param userId - The ID of the user to fetch the profile picture for.
   * @returns A stream of the user's profile picture.
   */
  @ApiOperation({ summary: 'Stream profile picture by user ID' })
  @ApiResponse({ status: 200, description: 'Image stream' })
  @UseGuards(AuthGuard)
  @Get('get-profile-picture/:userId')
  async getProfilePictureByUserId(
    @Param('userId') userId: number,
  ): Promise<StreamableFile> {
    const stream = await this.influencerService.getProfilePicture(userId);

    return new StreamableFile(stream);
  }

  /**
   * Streams the profile picture of the currently authenticated user.
   *
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A stream of the user's profile picture.
   */
  @ApiOperation({ summary: 'Stream user profile picture' })
  @UseGuards(AuthGuard)
  @Get('get-company-profile-picture/:filename')
  async getProfilePicture(
    @Param('filename') filename: string,
  ): Promise<StreamableFile> {
    const file = await this.minioService.getFile(
      BucketType.company_pictures,
      filename,
    );
    return new StreamableFile(file);
  }

  /**
   * Updates the entire portfolio of the currently authenticated user.
   *
   * @param files - The uploaded files representing the new portfolio.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves when the portfolio is successfully updated.
   */
  @ApiOperation({ summary: 'Update user portfolio' })
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AuthGuard)
  @Put('update-all-portfolio')
  async updateAllPortfolio(
    @UploadedFiles() files: Express.Multer.File[],
    @IdFromJWT() userId: number,
  ): Promise<PortfolioUpdatedDto> {
    const newPortfolio = await this.influencerService.updateAllPortfolio(
      userId,
      files,
    );
    return new PortfolioUpdatedDto(newPortfolio);
  }

  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AuthGuard)
  @Put('add-pictures-to-portfolio')
  async AddPicturesToPortfolio(
    @UploadedFiles() files: Express.Multer.File[],
    @IdFromJWT() userId: number,
  ): Promise<any> {
    await this.influencerService.addPicturesToPortfolio(userId, files);
  }

  @UseGuards(AuthGuard)
  @Delete('remove-picture-from-portfolio/:picture_url')
  async RemovePictureFromPortfolio(
    @IdFromJWT() userId: number,
    @Param('picture_url') pictureUrl: string,
  ): Promise<any> {
    await this.influencerService.removePictureFromPortfolio(userId, pictureUrl);
  }

  /**
   * Retrieves a specific portfolio file of the currently authenticated user.
   *
   * @param name - The name of the portfolio file to retrieve.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A stream of the requested portfolio file.
   */
  @ApiOperation({ summary: 'Get specific portfolio file' })
  @UseGuards(AuthGuard)
  @Get('get-portfolio/:name')
  async getPortfolio(
    @IdFromJWT() userId: number,
    @Param('name') name: string,
  ): Promise<StreamableFile> {
    const stream = await this.influencerService.getPortfolio(userId, name);
    return new StreamableFile(stream);
  }

  @ApiOperation({ summary: 'Get specific portfolio file' })
  @UseGuards(AuthGuard)
  @Get('get-portfolio/:name/:user_id')
  async getPortfolioByUserId(
    @Param('user_id') userId: number,
    @Param('name') name: string,
  ): Promise<StreamableFile> {
    const stream = await this.influencerService.getPortfolio(userId, name);
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
    await this.influencerService.updateName(userId, body.name);
  }

  @UseGuards(AuthGuard)
  @Put('update-vat-number')
  async updateVATNumber(
    @IdFromJWT() userId: number,
    @Body() body: UpdateVATNumberDto,
  ): Promise<void> {
    await this.influencerService.updateVATNumber(userId, body.vat_number);
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
    await this.influencerService.updateDescription(userId, body.description);
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
    await this.influencerService.updateDepartment(userId, body.department);
  }

  /**
   * Updates the themes of the currently authenticated user.
   *
   * @param themes - The new themes to update.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves when the themes are successfully updated.
   */
  @ApiOperation({ summary: 'Update user themes' })
  @UseGuards(AuthGuard)
  @Put('update-themes')
  async updateThemes(
    @IdFromJWT() userId: number,
    @Body() body: UpdateThemesDto,
  ): Promise<void> {
    await this.influencerService.updateThemes(userId, body.themes);
  }

  /**
   * Updates the target audience of the currently authenticated user.
   *
   * @param targetAudience - The new target audience to update.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves when the target audience is successfully updated.
   */
  @ApiOperation({ summary: 'Update user target audience' })
  @UseGuards(AuthGuard)
  @Put('update-target-audience')
  async updateTargetAudience(
    @Body() body: UpdateTargetAudienceDto,

    @IdFromJWT() userId: number,
  ): Promise<void> {
    await this.influencerService.updateTargetAudience(
      userId,
      body.target_audience,
    );
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
    await this.influencerService.createSocialNetwork(
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
    const sn = await this.influencerService.getSocialNetworks(userId);
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
    await this.influencerService.deleteSocialNetwork(userId, socialNetworkId);
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
    await this.influencerService.updateSocialNetwork(userId, body.id, body.url);
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
    await this.influencerService.addLegalDocument(userId, type, file);
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
    await this.influencerService.deleteLegalDocument(userId, type);
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
    const status = await this.influencerService.getLegalDocumentStatus(
      userId,
      type,
    );
    return { status: status };
  }

  /**
   * Retrieves the account link for the user to complete their Stripe onboarding.
   *
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns The URL of the account link for Stripe onboarding.
   */
  @ApiOperation({
    summary: 'Get the Stripe account link for the user to complete onboarding',
  })
  @UseGuards(AuthGuard)
  @Get('stripe/account-link')
  async getStripeAccountLink(
    @IdFromJWT() userId: number,
  ): Promise<{ url: string }> {
    const url = await this.influencerService.getStripeAccountLink(userId);

    return { url: url };
  }

  /**
   * Checks if the influencer has completed all required legal documents.
   *
   * @param userId - Extracted from JWT, identifies the current user.
   * @returns An object `{ has_completed: boolean }` indicating completion status.
   *
   * @route GET /has-completed/legal-documents
   * @access Protected (requires valid JWT)
   */
  @ApiOperation({ summary: 'Check if influencer completed legal documents' })
  @UseGuards(AuthGuard)
  @Get('has-completed/legal-documents')
  async hasCompletedLegalDocuments(@IdFromJWT() userId: number): Promise<any> {
    const hasCompleted =
      await this.influencerService.hasCompletedDocuments(userId);
    return { has_completed: hasCompleted };
  }

  /**
   * Checks if the influencer has completed their Stripe account setup.
   *
   * @param userId - Extracted from JWT, identifies the current user.
   * @returns An object `{ has_completed: boolean }` indicating Stripe onboarding status.
   *
   * @route GET /has-completed/stripe
   * @access Protected (requires valid JWT)
   */
  @ApiOperation({ summary: 'Check if influencer completed Stripe onboarding' })
  @UseGuards(AuthGuard)
  @Get('has-completed/stripe')
  async hasCompletedStripe(@IdFromJWT() userId: number): Promise<any> {
    const hasCompleted =
      await this.influencerService.hasCompletedStripe(userId);
    return { has_completed: hasCompleted };
  }

  @ApiOperation({
    summary: 'Get Stripe Express dashboard link',
    description: `Returns a short-lived login URL to the influencer's Stripe Express dashboard. 
  This allows the user to manage their payout information and account settings directly on Stripe.`,
  })
  @UseGuards(AuthGuard)
  @Get('stripe/login-link')
  async getAccountSettingsLink(@IdFromJWT() userId: number) {
    const url = await this.influencerService.createLoginLink(userId);
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
  @Get('has-completed-profile')
  async hasCompletedProfile(@IdFromJWT() userId: number): Promise<any> {
    let hasCompletedProfile =
      await this.influencerService.hasCompletedProfile(userId);
    return { has_completed_profile: hasCompletedProfile };
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Get()
  async getInfluencer(@IdFromJWT() userId: number): Promise<InfluencerDto> {
    let influencer = await this.influencerService.getInfluencer(userId);
    let socialNetworks = await this.influencerService.getSocialNetworks(userId);
    /// Add statistics
    return InfluencerDto.fromEntity(influencer, socialNetworks);
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Get('get-profile-completion-status')
  async getProfileCompletionStatus(
    @IdFromJWT() userId: number,
  ): Promise<InfluencerProfileCompletionStatusDto> {
    let e = await this.influencerService.getProfileCompletionStatus(userId);
    return InfluencerProfileCompletionStatusDto.fromEntity(e);
  }

  @ApiOperation({ summary: 'Get all collaborations for the influencer' })
  @UseGuards(AuthGuard)
  @Get('collaborations')
  async getInfluencerCollaborations(
    @IdFromJWT() userId: number,
  ): Promise<CollaborationEntity[]> {
    return this.collaborationService.getCollaborationsByInfluencer(userId);
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
  @Get('get-collaboration-summaries')
  async getCollaborationSummaries(
    @IdFromJWT() userId: number,
  ): Promise<CollaborationSummaryDto[]> {
    const influencer = await this.influencerService.getInfluencer(userId);
    const summaries = await this.collaborationService.getSummariesByInfluencer(
      influencer.id,
    );
    return CollaborationSummaryDto.fromEntities(summaries);
  }

  @UseGuards(AuthGuard)
  @Get('accept-collaboration/:collaboration_id')
  async acceptCollaboration(
    @Param('collaboration_id') collaborationId: number,
  ): Promise<void> {
    await this.collaborationService.acceptCollaboration(collaborationId);
  }

  @UseGuards(AuthGuard)
  @Get('refuse-collaboration/:collaboration_id')
  async refuseCollaboration(
    @Param('collaboration_id') collaborationId: number,
  ): Promise<void> {
    await this.collaborationService.refuseCollaboration(collaborationId);
  }

  @UseGuards(AuthGuard)
  @Get('end-collaboration/:collaboration_id')
  async endCollaboration(
    @Param('collaboration_id') collaborationId: number,
  ): Promise<void> {
    await this.collaborationService.endCollaboration(collaborationId);
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

  @ApiOperation({ summary: 'Get collaboration by ID' })
  @UseGuards(AuthGuard)
  @Get('get-collaboration/:id')
  async getCollaboration(@Param('id') id: number): Promise<CollaborationDto> {
    const collab = await this.collaborationService.getCollaboration(id);
    return CollaborationDto.fromEntity(collab);
  }

  @ApiOperation({ summary: '' })
  @UseGuards(AuthGuard)
  @Get('get-company/:user_id')
  async getCompany(@Param('user_id') userId: number): Promise<any> {
    let company = await this.companyService.getCompany(userId);
    let socialNetworks = await this.companyService.getSocialNetworks(userId);
    return CompanyDto.fromEntity(company, socialNetworks);
  }

  @ApiOperation({ summary: '' })
  @UseGuards(AuthGuard)
  @Get('get-company-completion-status/:user_id')
  async getCompletionStatus(@Param('user_id') userId: number): Promise<any> {
    let e = await this.companyService.getProfileCompletionStatus(userId);
    return CompanyProfileCompletionStatusDto.fromEntity(e);
  }

  @ApiOperation({ summary: '' })
  @UseGuards(AuthGuard)
  @Get('get-company-instagram-statistics/:user_id')
  async getInfluencerInstagramStatistics(
    @Param('user_id') userId: number,
  ): Promise<any> {
    await this.facebookService.refreshInstagramStatistics(userId);
    const instagramAccount =
      await this.facebookService.getInstagramAccount(userId);
    return InstagramAccountDto.fromEntity(instagramAccount);
  }

  @UseGuards(AuthGuard)
  @Get('get-review-summaries')
  async getReviewSummaries(
    @IdFromJWT() userId: number,
  ): Promise<ReviewSummaryDto[]> {
    let r =
      await this.collaborationService.getInfluencerReviewSummaries(userId);
    return ReviewSummaryDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-collaborated-companies')
  async getCollaboratedCompanies(
    @IdFromJWT() userId: number,
  ): Promise<CollaboratedCompanyDto[]> {
    let r = await this.collaborationService.getCollaboratedCompanies(userId);
    return CollaboratedCompanyDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-company-collaborated-influencer/:company_user_id')
  async getCompanyCollaboratedInfluencers(
    @Param('company_user_id') userId: number,
  ): Promise<InfluencerSummaryDto[]> {
    let r = await this.collaborationService.getCollaboratedInfluencers(userId);
    return InfluencerSummaryDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-dashboard/statistics')
  async getStatistics(
    @IdFromJWT() userId: number,
  ): Promise<InfluencerStatisticsDto> {
    let r = await this.influencerService.getStatistics(userId);
    return InfluencerStatisticsDto.fromEntity(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-dashboard/collaborations')
  async getRecentCollaborations(
    @IdFromJWT() userId: number,
  ): Promise<CollaborationSummaryDto[]> {
    let r =
      await this.collaborationService.getRecentCollaborationsByInfluencerId(
        userId,
      );
    return CollaborationSummaryDto.fromEntities(r);
  }

  @UseGuards(AuthGuard)
  @Get('get-all-conversations')
  async getAllConversations(
    @IdFromJWT() userId: number,
  ): Promise<ConversationSummaryDto[]> {
    let influencer = await this.influencerService.getInfluencer(userId);
    let r = await this.conversationService.getConversations(influencer.id);
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
      'influencer',
    );
  }

  @UseGuards(AuthGuard)
  @Post('add-message')
  async addMessage(
    @IdFromJWT() userId: number,
    @Body() dto: AddMessageDto,
  ): Promise<void> {
    const influencer = await this.influencerService.getInfluencer(userId);

    const message = await this.conversationService.addMessage(
      dto.conversation_id,
      'influencer',
      influencer.id,
      dto.content,
    );
  }

  // @Post('testing')
  // async testing(): Promise<void> {
  //   await this.conversationService.addMessage(11, 'influencer', 41, 'Testing');
  // }

  @UseGuards(AuthGuard)
  @Get('preferences')
  async getPreferences(
    @IdFromJWT() userId: number,
  ): Promise<UserNotificationPreferenceDto[]> {
    const entities =
      await this.notificationService.getPreferencesByUserId(userId);
    return UserNotificationPreferenceDto.fromEntities(entities);
  }

  @UseGuards(AuthGuard)
  @Put('preference')
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
