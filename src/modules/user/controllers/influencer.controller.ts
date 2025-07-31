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
import { InfluencerService } from '../services/inlfuencer.service';
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

@Controller('influencer')
export class InfluencerController {
  constructor(
    private readonly influencerService: InfluencerService,
    private readonly facebookService: FacebookService,
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
  @Get('get-profile-picture')
  async getProfilePicture(
    @IdFromJWT() userId: number,
  ): Promise<StreamableFile> {
    const stream = await this.influencerService.getProfilePicture(userId);
    return new StreamableFile(stream);
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

  // @Get('zeubi')
  // // @UseGuards(AuthGuard)
  // async zeubi(): Promise<void> {
  //   try {
  //     await this.facebookService.getInstagramStatistics(35);
  //   } catch (error) {
  //     if (error.isAxiosError && error.response) {
  //       console.error(
  //         'API error:',
  //         JSON.stringify(error?.response?.data || error.message, null, 2),
  //       );
  //     } else {
  //       console.error('Error:', error.message);
  //     }
  //   }
  // }
}
