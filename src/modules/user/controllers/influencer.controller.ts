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
import { CreateReviewDto } from '../dtos/create-review.dto';
import { ReviewDto } from '../dtos/review.dto';
import { CollaborationDto } from '../dtos/collaboration.dto';
import { CompanyDto } from '../dtos/company.dto';
import { CompanyProfileCompletionStatusDto } from '../dtos/company-profile-completion-status.dto';
import { ReviewSummaryDto } from '../dtos/review_summary.dto';
import { CollaboratedCompanyDto } from '../dtos/collaborated_company.dto';
import { InfluencerSummaryDto } from '../dtos/influencer-summary.dto';
import { InfluencerStatisticsDto } from '../dtos/influencer_statistics.dto';
import { ConversationSummaryDto } from 'src/modules/conversation/dtos/conversation.dto';
import { ConversationService } from 'src/modules/conversation/conversation.service';
import { MessageDto } from 'src/modules/conversation/dtos/message.dto';
import { AddMessageDto } from 'src/modules/conversation/dtos/add-message.dto';
import { NotificationService } from 'src/modules/notification/notification.service';
import { UserNotificationPreferenceDto } from 'src/modules/notification/dto/user_notification_preference.dto';
import { UpdateUserNotificationPreferenceDto } from 'src/modules/notification/dto/update_user_notification_preference.dto';
import { BucketType } from 'src/commons/enums/bucket_type';
import { MinioService } from 'src/modules/minio/minio.service';
import { UpdateSiretDto } from '../dtos/update-siret.dto';

@Controller('influencer')
export class InfluencerController {
  constructor(
    private readonly influencerService: InfluencerService,
    private readonly companyService: CompanyService,
    private readonly facebookService: FacebookService,
    private readonly collaborationService: CollaborationService,
    private readonly conversationService: ConversationService,
    private readonly notificationService: NotificationService,
    private readonly minioService: MinioService,
  ) {}

  /** Upload or update profile picture */
  @ApiOperation({ summary: 'Upload or update profile picture' })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @Put('profile-picture')
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @IdFromJWT() userId: number,
  ): Promise<ProfilePictureUpdatedDto> {
    const newPic = await this.influencerService.updateProfilePicture(
      userId,
      file,
    );
    return new ProfilePictureUpdatedDto(newPic);
  }

  /** Replace all portfolio files */
  @ApiOperation({ summary: 'Replace portfolio' })
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AuthGuard)
  @Put('portfolio')
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

  /** Add pictures to portfolio */
  @ApiOperation({ summary: 'Add portfolio pictures' })
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AuthGuard)
  @Post('portfolio/pictures')
  async addPicturesToPortfolio(
    @UploadedFiles() files: Express.Multer.File[],
    @IdFromJWT() userId: number,
  ): Promise<void> {
    await this.influencerService.addPicturesToPortfolio(userId, files);
  }

  /** Remove picture from portfolio */
  @ApiOperation({ summary: 'Remove portfolio picture' })
  @UseGuards(AuthGuard)
  @Delete('portfolio/pictures/:picture_url')
  async removePictureFromPortfolio(
    @IdFromJWT() userId: number,
    @Param('picture_url') pictureUrl: string,
  ): Promise<void> {
    await this.influencerService.removePictureFromPortfolio(userId, pictureUrl);
  }

  /** Update name */
  @ApiOperation({ summary: 'Update name' })
  @UseGuards(AuthGuard)
  @Put('name')
  async updateName(
    @IdFromJWT() userId: number,
    @Body() body: UpdateNameDto,
  ): Promise<void> {
    await this.influencerService.updateName(userId, body.name);
  }

  /** Update VAT number */
  @ApiOperation({ summary: 'Update VAT number' })
  @UseGuards(AuthGuard)
  @Put('vat-number')
  async updateVATNumber(
    @IdFromJWT() userId: number,
    @Body() body: UpdateVATNumberDto,
  ): Promise<void> {
    await this.influencerService.updateVATNumber(userId, body.vat_number);
  }

  /** Update description */
  @ApiOperation({ summary: 'Update description' })
  @UseGuards(AuthGuard)
  @Put('description')
  async updateDescription(
    @IdFromJWT() userId: number,
    @Body() body: UpdateDescriptionDto,
  ): Promise<void> {
    await this.influencerService.updateDescription(userId, body.description);
  }

  /** Update department */
  @ApiOperation({ summary: 'Update department' })
  @UseGuards(AuthGuard)
  @Put('department')
  async updateDepartment(
    @IdFromJWT() userId: number,
    @Body() body: UpdateDepartmentDto,
  ): Promise<void> {
    await this.influencerService.updateDepartment(userId, body.department);
  }

  /** Update themes */
  @ApiOperation({ summary: 'Update themes' })
  @UseGuards(AuthGuard)
  @Put('themes')
  async updateThemes(
    @IdFromJWT() userId: number,
    @Body() body: UpdateThemesDto,
  ): Promise<void> {
    await this.influencerService.updateThemes(userId, body.themes);
  }

  /** Update target audience */
  @ApiOperation({ summary: 'Update target audience' })
  @UseGuards(AuthGuard)
  @Put('target-audience')
  async updateTargetAudience(
    @IdFromJWT() userId: number,
    @Body() body: UpdateTargetAudienceDto,
  ): Promise<void> {
    await this.influencerService.updateTargetAudience(
      userId,
      body.target_audience,
    );
  }

  /** Add social network */
  @ApiOperation({ summary: 'Add social network' })
  @UseGuards(AuthGuard)
  @Post('social-networks')
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

  /** Get social networks */
  @ApiOperation({ summary: 'Get social networks' })
  @UseGuards(AuthGuard)
  @Get('social-networks')
  async getSocialNetworks(
    @IdFromJWT() userId: number,
  ): Promise<SocialNetworkDto[]> {
    const sn = await this.influencerService.getSocialNetworks(userId);
    return SocialNetworkDto.fromEntities(sn);
  }

  /** Delete social network */
  @ApiOperation({ summary: 'Delete social network' })
  @UseGuards(AuthGuard)
  @Delete('social-networks/:id')
  async deleteSocialNetwork(
    @IdFromJWT() userId: number,
    @Param('id') id: string,
  ): Promise<void> {
    await this.influencerService.deleteSocialNetwork(userId, id);
  }

  /** Update social network */
  @ApiOperation({ summary: 'Update social network' })
  @UseGuards(AuthGuard)
  @Put('social-networks/:id')
  async updateSocialNetwork(
    @IdFromJWT() userId: number,
    @Param('id') id: string,
    @Body() body: UpdateSocialNetworkDto,
  ): Promise<void> {
    await this.influencerService.updateSocialNetwork(userId, id, body.url);
  }

  /** Add legal document */
  @ApiOperation({ summary: 'Add legal document' })
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('legal-documents/:type')
  async addLegalDocument(
    @IdFromJWT() userId: number,
    @Param('type') type: LegalDocumentType,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    await this.influencerService.addLegalDocument(userId, type, file);
  }

  /** Delete legal document */
  @ApiOperation({ summary: 'Delete legal document' })
  @UseGuards(AuthGuard)
  @Delete('legal-documents/:type')
  async deleteLegalDocument(
    @IdFromJWT() userId: number,
    @Param('type') type: LegalDocumentType,
  ): Promise<void> {
    await this.influencerService.deleteLegalDocument(userId, type);
  }

  /** Get legal document status */
  @ApiOperation({ summary: 'Get legal document status' })
  @UseGuards(AuthGuard)
  @Get('legal-documents/:type/status')
  async getLegalDocumentStatus(
    @IdFromJWT() userId: number,
    @Param('type') type: LegalDocumentType,
  ): Promise<any> {
    const status = await this.influencerService.getLegalDocumentStatus(
      userId,
      type,
    );
    return { status };
  }

  /** Check if influencer completed legal documents */
  @ApiOperation({ summary: 'Check if legal documents completed' })
  @UseGuards(AuthGuard)
  @Get('legal-documents/completed')
  async hasCompletedLegalDocuments(@IdFromJWT() userId: number): Promise<any> {
    const done = await this.influencerService.hasCompletedDocuments(userId);
    return { has_completed: done };
  }

  /** Get Stripe onboarding link */
  @ApiOperation({ summary: 'Get Stripe onboarding link' })
  @UseGuards(AuthGuard)
  @Get('payments/account-link')
  async getStripeAccountLink(
    @IdFromJWT() userId: number,
  ): Promise<{ url: string }> {
    const url = await this.influencerService.getStripeAccountLink(userId);
    return { url };
  }

  /** Check if Stripe onboarding completed */
  @ApiOperation({ summary: 'Check if Stripe onboarding completed' })
  @UseGuards(AuthGuard)
  @Get('payments/completed')
  async hasCompletedStripe(@IdFromJWT() userId: number): Promise<any> {
    const done = await this.influencerService.hasCompletedStripe(userId);
    return { has_completed: done };
  }

  /** Get Stripe login link */
  @ApiOperation({ summary: 'Get Stripe login link' })
  @UseGuards(AuthGuard)
  @Get('payments/login-link')
  async getAccountSettingsLink(@IdFromJWT() userId: number) {
    const url = await this.influencerService.createLoginLink(userId);
    return { url };
  }

  /** Check if Instagram account linked */
  @ApiOperation({ summary: 'Check if Instagram account linked' })
  @UseGuards(AuthGuard)
  @Get('social/instagram/has-account')
  async hasInstagramAccount(@IdFromJWT() userId: number): Promise<any> {
    const hasAcc = await this.facebookService.hasInstagramAccount(userId);
    return { has_instagram_account: hasAcc };
  }

  /** Get Instagram account details */
  @ApiOperation({ summary: 'Get Instagram account' })
  @UseGuards(AuthGuard)
  @Get('social/instagram')
  async getInstagramAccount(
    @IdFromJWT() userId: number,
  ): Promise<InstagramAccountDto> {
    await this.facebookService.refreshInstagramStatistics(userId);
    const acc = await this.facebookService.getInstagramAccount(userId);
    return InstagramAccountDto.fromEntity(acc);
  }

  /** Link a fetched Instagram account */
  @ApiOperation({ summary: 'Link fetched Instagram account' })
  @UseGuards(AuthGuard)
  @Get('social/instagram/:fetched_instagram_account_id')
  async createInstagramAccount(
    @IdFromJWT() userId: number,
    @Param('fetched_instagram_account_id') fetchedId: string,
  ): Promise<void> {
    await this.facebookService.createInstagramAccount(userId, fetchedId);
  }

  /** Get influencer profile */
  @ApiOperation({ summary: 'Get influencer profile' })
  @UseGuards(AuthGuard)
  @Get()
  async getInfluencer(@IdFromJWT() userId: number): Promise<InfluencerDto> {
    const influencer = await this.influencerService.getInfluencer(userId);
    const sn = await this.influencerService.getSocialNetworks(userId);
    return InfluencerDto.fromEntity(influencer, sn);
  }

  /** Check if profile completed */
  @ApiOperation({ summary: 'Check if profile completed' })
  @UseGuards(AuthGuard)
  @Get('profile/completed')
  async hasCompletedProfile(@IdFromJWT() userId: number): Promise<any> {
    const done = await this.influencerService.hasCompletedProfile(userId);
    return { has_completed_profile: done };
  }

  /** Get profile completion status */
  @ApiOperation({ summary: 'Get profile completion status' })
  @UseGuards(AuthGuard)
  @Get('profile/completion-status')
  async getProfileCompletionStatus(
    @IdFromJWT() userId: number,
  ): Promise<InfluencerProfileCompletionStatusDto> {
    const e = await this.influencerService.getProfileCompletionStatus(userId);
    return InfluencerProfileCompletionStatusDto.fromEntity(e);
  }

  /** Get all collaborations for influencer */
  @ApiOperation({ summary: 'Get all collaborations' })
  @UseGuards(AuthGuard)
  @Get('collaborations')
  async getInfluencerCollaborations(
    @IdFromJWT() userId: number,
  ): Promise<CollaborationEntity[]> {
    return this.collaborationService.getCollaborationsByInfluencer(userId);
  }

  /** Get collaboration summaries */
  @ApiOperation({ summary: 'Get collaboration summaries' })
  @UseGuards(AuthGuard)
  @Get('collaborations/summaries')
  async getCollaborationSummaries(
    @IdFromJWT() userId: number,
  ): Promise<CollaborationSummaryDto[]> {
    const influencer = await this.influencerService.getInfluencer(userId);
    const summaries = await this.collaborationService.getSummariesByInfluencer(
      influencer.id,
    );
    return CollaborationSummaryDto.fromEntities(summaries);
  }

  /** Accept collaboration */
  @ApiOperation({ summary: 'Accept collaboration' })
  @UseGuards(AuthGuard)
  @Post('collaborations/:id/accept')
  async acceptCollaboration(@Param('id') id: number): Promise<void> {
    await this.collaborationService.acceptCollaboration(id);
  }

  /** Refuse collaboration */
  @ApiOperation({ summary: 'Refuse collaboration' })
  @UseGuards(AuthGuard)
  @Post('collaborations/:id/refuse')
  async refuseCollaboration(@Param('id') id: number): Promise<void> {
    await this.collaborationService.refuseCollaboration(id);
  }

  /** End collaboration */
  @ApiOperation({ summary: 'End collaboration' })
  @UseGuards(AuthGuard)
  @Post('collaborations/:id/end')
  async endCollaboration(@Param('id') id: number): Promise<void> {
    await this.collaborationService.endCollaboration(id);
  }

  /** Create review */
  @ApiOperation({ summary: 'Create review' })
  @UseGuards(AuthGuard)
  @Post('reviews')
  async createReview(
    @Body() body: CreateReviewDto,
    @IdFromJWT() userId: number,
  ): Promise<void> {
    await this.collaborationService.createReview(
      body.collaboration_id,
      userId,
      body.reviewed_id,
      body.stars,
      body.description,
    );
  }

  /** Get review */
  @ApiOperation({ summary: 'Get review' })
  @UseGuards(AuthGuard)
  @Get('reviews/:collaboration_id/:author_id/:reviewed_id')
  async getReview(
    @Param('collaboration_id') collabId: number,
    @Param('author_id') authorId: number,
    @Param('reviewed_id') reviewedId: number,
  ): Promise<any> {
    const r = await this.collaborationService.getReview(
      collabId,
      authorId,
      reviewedId,
    );
    if (!r) return { review: null };
    return { review: ReviewDto.fromEntity(r) };
  }

  /** Get reviews by author */
  @ApiOperation({ summary: 'Get reviews by author' })
  @UseGuards(AuthGuard)
  @Get('reviews/author/:id')
  async getReviewsByAuthor(
    @Param('id') authorId: number,
  ): Promise<ReviewDto[]> {
    const r = await this.collaborationService.getReviewsByAuthor(authorId);
    return ReviewDto.fromEntities(r);
  }

  /** Get reviews by reviewed */
  @ApiOperation({ summary: 'Get reviews by reviewed' })
  @UseGuards(AuthGuard)
  @Get('reviews/reviewed/:id')
  async getReviewsByReviewed(
    @Param('id') reviewedId: number,
  ): Promise<ReviewDto[]> {
    const r = await this.collaborationService.getReviewsByReviewed(reviewedId);
    return ReviewDto.fromEntities(r);
  }

  /** Get review summaries */
  @ApiOperation({ summary: 'Get review summaries' })
  @UseGuards(AuthGuard)
  @Get('reviews/summaries')
  async getReviewSummaries(
    @IdFromJWT() userId: number,
  ): Promise<ReviewSummaryDto[]> {
    const r =
      await this.collaborationService.getInfluencerReviewSummaries(userId);
    return ReviewSummaryDto.fromEntities(r);
  }

  /** Get company by user ID */
  @ApiOperation({ summary: 'Get company by user ID' })
  @UseGuards(AuthGuard)
  @Get('companies/:user_id')
  async getCompany(@Param('user_id') userId: number): Promise<any> {
    const company = await this.companyService.getCompany(userId);
    const sn = await this.companyService.getSocialNetworks(userId);
    return CompanyDto.fromEntity(company, sn);
  }

  /** Get company profile completion status */
  @ApiOperation({ summary: 'Get company completion status' })
  @UseGuards(AuthGuard)
  @Get('companies/:user_id/completion-status')
  async getCompletionStatus(@Param('user_id') userId: number): Promise<any> {
    const e = await this.companyService.getProfileCompletionStatus(userId);
    return CompanyProfileCompletionStatusDto.fromEntity(e);
  }

  /** Get company Instagram statistics */
  @ApiOperation({ summary: 'Get company Instagram statistics' })
  @UseGuards(AuthGuard)
  @Get('companies/:user_id/instagram-statistics')
  async getInfluencerInstagramStatistics(
    @Param('user_id') userId: number,
  ): Promise<any> {
    await this.facebookService.refreshInstagramStatistics(userId);
    const acc = await this.facebookService.getInstagramAccount(userId);
    return InstagramAccountDto.fromEntity(acc);
  }

  /** Get collaborated companies */
  @ApiOperation({ summary: 'Get collaborated companies' })
  @UseGuards(AuthGuard)
  @Get('companies/collaborated')
  async getCollaboratedCompanies(
    @IdFromJWT() userId: number,
  ): Promise<CollaboratedCompanyDto[]> {
    const r = await this.collaborationService.getCollaboratedCompanies(userId);
    return CollaboratedCompanyDto.fromEntities(r);
  }

  /** Get influencers collaborated with a company */
  @ApiOperation({ summary: 'Get influencers collaborated with company' })
  @UseGuards(AuthGuard)
  @Get('companies/:company_user_id/collaborated-influencers')
  async getCompanyCollaboratedInfluencers(
    @Param('company_user_id') userId: number,
  ): Promise<InfluencerSummaryDto[]> {
    const r =
      await this.collaborationService.getCollaboratedInfluencers(userId);
    return InfluencerSummaryDto.fromEntities(r);
  }

  /** Get influencer statistics */
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @UseGuards(AuthGuard)
  @Get('dashboard/statistics')
  async getStatistics(
    @IdFromJWT() userId: number,
  ): Promise<InfluencerStatisticsDto> {
    const r = await this.influencerService.getStatistics(userId);
    return InfluencerStatisticsDto.fromEntity(r);
  }

  /** Get recent collaborations */
  @ApiOperation({ summary: 'Get recent collaborations' })
  @UseGuards(AuthGuard)
  @Get('dashboard/collaborations')
  async getRecentCollaborations(
    @IdFromJWT() userId: number,
  ): Promise<CollaborationSummaryDto[]> {
    const r =
      await this.collaborationService.getRecentCollaborationsByInfluencerId(
        userId,
      );
    return CollaborationSummaryDto.fromEntities(r);
  }

  /** Get all conversations */
  @ApiOperation({ summary: 'Get all conversations' })
  @UseGuards(AuthGuard)
  @Get('conversations')
  async getAllConversations(
    @IdFromJWT() userId: number,
  ): Promise<ConversationSummaryDto[]> {
    const influencer = await this.influencerService.getInfluencer(userId);
    const r = await this.conversationService.getConversations(influencer.id);
    return ConversationSummaryDto.fromEntities(r);
  }

  /** Get messages by conversation */
  @ApiOperation({ summary: 'Get messages by conversation' })
  @UseGuards(AuthGuard)
  @Get('conversations/:conversation_id/messages')
  async getMessagesByConversationId(
    @Param('conversation_id') conversationId: number,
  ): Promise<MessageDto[]> {
    const r =
      await this.conversationService.getMessagesByConversationId(
        conversationId,
      );
    return MessageDto.fromEntities(r);
  }

  /** Mark messages as read */
  @ApiOperation({ summary: 'Mark messages as read' })
  @UseGuards(AuthGuard)
  @Post('conversations/:conversation_id/mark-as-read')
  async markConversationMessagesAsRead(
    @Param('conversation_id') conversationId: number,
  ): Promise<void> {
    await this.conversationService.markConversationMessagesAsRead(
      conversationId,
      'influencer',
    );
  }

  /** Add message to conversation */
  @ApiOperation({ summary: 'Add message to conversation' })
  @UseGuards(AuthGuard)
  @Post('conversations/:conversation_id/messages')
  async addMessage(
    @IdFromJWT() userId: number,
    @Param('conversation_id') conversationId: number,
    @Body() dto: AddMessageDto,
  ): Promise<void> {
    const influencer = await this.influencerService.getInfluencer(userId);
    await this.conversationService.addMessage(
      conversationId,
      'influencer',
      influencer.id,
      dto.content,
    );
  }

  /** Get notification preferences */
  @ApiOperation({ summary: 'Get notification preferences' })
  @UseGuards(AuthGuard)
  @Get('notifications/preferences')
  async getPreferences(
    @IdFromJWT() userId: number,
  ): Promise<UserNotificationPreferenceDto[]> {
    const entities =
      await this.notificationService.getPreferencesByUserId(userId);
    return UserNotificationPreferenceDto.fromEntities(entities);
  }

  /** Update notification preference */
  @ApiOperation({ summary: 'Update notification preference' })
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

  /** Get specific portfolio file */
  @ApiOperation({ summary: 'Get specific portfolio file' })
  @UseGuards(AuthGuard)
  @Get('portfolio/:name')
  async getPortfolioByUserId(
    @Param('name') name: string,
  ): Promise<StreamableFile> {
    const stream = await this.influencerService.getPortfolio(name);
    return new StreamableFile(stream);
  }

  /** Stream profile picture by filename */
  @ApiOperation({ summary: 'Stream profile picture by filename' })
  @Get('profile-pictures/:filename')
  async getProfilePicturebyFilename(
    @Param('filename') filename: string,
  ): Promise<StreamableFile> {
    const stream =
      await this.influencerService.getProfilePictureByFilename(filename);
    return new StreamableFile(stream);
  }

  /**
   * Get companies an influencer has collaborated with.
   */
  @UseGuards(AuthGuard)
  @Get('collaborations/collaborated-companies')
  async getInfluencerCollaboratedCompanies(
    @IdFromJWT() userId: number,
  ): Promise<CollaboratedCompanyDto[]> {
    const r = await this.collaborationService.getCollaboratedCompanies(userId);
    return CollaboratedCompanyDto.fromEntities(r);
  }

  /** Get platform quote */
  @UseGuards(AuthGuard)
  @Get('collaborations/:id/platform-quote')
  async getPlatformQuote(
    @Param('id') collaborationId: number,
  ): Promise<StreamableFile> {
    const f = await this.collaborationService.getPlatformQuote(collaborationId);
    return new StreamableFile(f);
  }

  /** Get platform invoice */
  @UseGuards(AuthGuard)
  @Get('collaborations/:id/platform-invoice')
  async getPlatformInvoice(
    @Param('id') collaborationId: number,
  ): Promise<StreamableFile> {
    const f =
      await this.collaborationService.getPlatformInvoice(collaborationId);
    return new StreamableFile(f);
  }

  /** Get influencer quote */
  @UseGuards(AuthGuard)
  @Get('collaborations/:id/influencer-quote')
  async getInfluencerQuote(
    @Param('id') collaborationId: number,
  ): Promise<StreamableFile> {
    const f =
      await this.collaborationService.getInfluencerQuote(collaborationId);
    return new StreamableFile(f);
  }

  @UseGuards(AuthGuard)
  @Get('collaborations/:id/contract')
  async getContract(
    @Param('id') collaborationId: number,
  ): Promise<StreamableFile> {
    const f = await this.collaborationService.getContract(collaborationId);
    return new StreamableFile(f);
  }

  /** Get influencer invoice */
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

  /** Get collaboration by ID */
  @ApiOperation({ summary: 'Get collaboration by ID' })
  @UseGuards(AuthGuard)
  @Get('collaborations/:id')
  async getCollaboration(@Param('id') id: number): Promise<CollaborationDto> {
    const collab = await this.collaborationService.getCollaboration(id);
    return CollaborationDto.fromEntity(collab);
  }

  @UseGuards(AuthGuard)
  @Put('siret')
  async updateSiret(
    @IdFromJWT() userId: number,
    @Body() body: UpdateSiretDto,
  ): Promise<void> {
    await this.influencerService.updateSiret(userId, body.siret);
  }
}
