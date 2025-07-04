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
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
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
}
