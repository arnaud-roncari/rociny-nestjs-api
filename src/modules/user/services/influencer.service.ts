import { Injectable } from '@nestjs/common';
import { FileRequiredException } from 'src/commons/errors/file-required';
import { InfluencerRepository } from '../repositories/influencer.repository';
import { UserNotFoundException } from 'src/commons/errors/user-not-found';
import { MinioService } from 'src/modules/minio/minio.service';
import { BucketType } from 'src/commons/enums/bucket_type';
import internal from 'stream';
import { FileNotFoundException } from 'src/commons/errors/file-not-found';
import { PlatformType } from 'src/commons/enums/platform_type';
import { SocialNetworkEntity } from '../entities/social_network.entity';
import { SocialNetworkExists } from 'src/commons/errors/social-network-already-exist';
import { LegalDocumentType } from 'src/commons/enums/legal_document_type';
import { LegalDocumentStatus } from 'src/commons/enums/legal_document_status';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { InfluencerEntity } from '../entities/influencer.entity';
import { InfluencerProfileCompletionStatusEntity } from '../entities/influencer_profile_completion_status.entity';
import { FacebookRepository } from 'src/modules/facebook/facebook.repository';
import { InfluencerStatisticsEntity } from '../entities/influencer_statistics.entity';

@Injectable()
export class InfluencerService {
  constructor(
    private readonly influencerRepository: InfluencerRepository,
    private readonly minioService: MinioService,
    private readonly stripeService: StripeService,
    private readonly facebookRepository: FacebookRepository,
  ) {}

  /**
   * Sets the profile picture for a user.
   *
   * @param userId - The ID of the user whose profile picture is being set.
   * @param file - The uploaded file containing the profile picture.
   * @throws Error if the file is not provided or the user is not found.
   */
  async updateProfilePicture(
    userId: number,
    file: Express.Multer.File,
  ): Promise<string> {
    if (!file) {
      throw new FileRequiredException();
    }

    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // Keep reference to previous profile pictore, to be deleted later
    const oldProfilePicture = user.profilePicture;

    // Upload new profile picture
    const newProfilePicture = await this.minioService.uploadFile(
      file,
      BucketType.influencer_pictures,
    );

    // Update user
    await this.influencerRepository.updateProfilePicture(
      userId,
      newProfilePicture,
    );

    /// Delete previous profile picture
    if (oldProfilePicture) {
      await this.minioService.removeFile(
        BucketType.influencer_pictures,
        oldProfilePicture,
      );
    }

    return newProfilePicture;
  }

  /**
   * Retrieves the profile picture URL for a user.
   *
   * @param userId - The ID of the user whose profile picture is being retrieved.
   * @returns The URL of the profile picture.
   * @throws Error if the user is not found or the profile picture does not exist.
   */
  async getProfilePicture(userId: number): Promise<internal.Readable> {
    console.log(userId);

    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const file = await this.minioService.getFile(
      BucketType.influencer_pictures,
      user.profilePicture,
    );

    return file;
  }

  /**
   * Updates the portfolio for a user.
   *
   * @param userId - The ID of the user whose portfolio is being updated.
   * @param files - The uploaded files for the portfolio.
   * @throws Error if no files are provided or the user is not found.
   */
  async updateAllPortfolio(
    userId: number,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new FileRequiredException();
    }

    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // Keep references to previous portfolio files, to be deleted later
    const oldPortfolio = user.portfolio || [];

    // Upload new portfolio files
    const newPortfolio = await Promise.all(
      files.map((file) =>
        this.minioService.uploadFile(file, BucketType.portfolios),
      ),
    );

    // Update user
    await this.influencerRepository.updatePortfolio(userId, newPortfolio);

    // Delete previous portfolio files
    await Promise.all(
      oldPortfolio.map((file) =>
        this.minioService.removeFile(BucketType.portfolios, file),
      ),
    );

    return newPortfolio;
  }

  async addPicturesToPortfolio(
    userId: number,
    files: Express.Multer.File[],
  ): Promise<void> {
    if (!files || files.length === 0) {
      throw new FileRequiredException();
    }

    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const newPictures = await Promise.all(
      files.map((file) =>
        this.minioService.uploadFile(file, BucketType.portfolios),
      ),
    );

    await this.influencerRepository.addPicturesToPortfolio(userId, newPictures);
  }

  async removePictureFromPortfolio(
    userId: number,
    pictureUrl: string,
  ): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.removePictureFromPortfolio(
      userId,
      pictureUrl,
    );

    await this.minioService.removeFile(BucketType.portfolios, pictureUrl);
  }

  /**
   * Retrieves a specific portfolio file for a user by its name.
   *
   * @param userId - The ID of the user whose portfolio file is being retrieved.
   * @param fileName - The name of the portfolio file to retrieve.
   * @returns The file as a readable stream.
   * @throws Error if the user is not found or the file does not exist.
   */
  async getPortfolio(
    userId: number,
    fileName: string,
  ): Promise<internal.Readable> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (!user.portfolio || !user.portfolio.includes(fileName)) {
      throw new FileNotFoundException();
    }

    const file = await this.minioService.getFile(
      BucketType.portfolios,
      fileName,
    );

    return file;
  }

  /**
   * Updates the name of the user.
   *
   * @param userId - The ID of the user whose name is being updated.
   * @param name - The new name for the user.
   * @throws Error if the user is not found.
   */
  async updateName(userId: number, name: string): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.updateName(userId, name);
  }

  async updateVATNumber(userId: number, vatNumber: string): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.stripeService.setConnectedVat(user.stripeAccountId, vatNumber);
    await this.influencerRepository.updateVATNumber(userId, vatNumber);
  }

  /**
   * Updates the description of the user.
   *
   * @param userId - The ID of the user whose description is being updated.
   * @param description - The new description for the user.
   * @throws Error if the user is not found.
   */
  async updateDescription(userId: number, description: string): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.updateDescription(userId, description);
  }

  /**
   * Updates the department of the user.
   *
   * @param userId - The ID of the user whose department is being updated.
   * @param department - The new department for the user.
   * @throws Error if the user is not found.
   */
  async updateDepartment(userId: number, department: string): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.updateDepartment(userId, department);
  }

  /**
   * Updates the themes of the user.
   *
   * @param userId - The ID of the user whose themes are being updated.
   * @param themes - The new themes for the user.
   * @throws Error if the user is not found.
   */
  async updateThemes(userId: number, themes: string[]): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.updateThemes(userId, themes);
  }

  /**
   * Updates the target audience of the user.
   *
   * @param userId - The ID of the user whose target audience is being updated.
   * @param targetAudience - The new target audience for the user.
   * @throws Error if the user is not found.
   */
  async updateTargetAudience(
    userId: number,
    targetAudience: string[],
  ): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.updateTargetAudience(
      userId,
      targetAudience,
    );
  }

  /**
   * Adds a social network to the user's profile.
   *
   * @param userId - The ID of the user whose social network is being added.
   * @param platform - The platform type of the social network (e.g., Instagram, Twitter).
   * @param url - The URL of the social network profile.
   * @throws UserNotFoundException if the user is not found.
   */
  async createSocialNetwork(
    userId: number,
    platform: PlatformType,
    url: string,
  ): Promise<void> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    const exists = await this.influencerRepository.getSocialNetworkByType(
      influencer.id,
      platform,
    );

    if (exists) {
      throw new SocialNetworkExists();
    }

    await this.influencerRepository.createSocialNetwork(
      influencer.id,
      platform,
      0,
      url,
    );
  }

  /**
   * Retrieves the social networks of the user.
   *
   * @param userId - The ID of the user.
   * @returns The list of social networks.
   * @throws Error if the user is not found.
   */
  async getSocialNetworks(userId: number): Promise<SocialNetworkEntity[]> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    const sn = await this.influencerRepository.getSocialNetworks(influencer.id);
    return sn;
  }

  /**
   * Deletes a social network from the user's profile.
   *
   * @param userId - The ID of the user.
   * @param socialNetworkId - The social network id to delete.
   * @throws Error if the user is not found or the social network does not exist.
   */
  async deleteSocialNetwork(
    userId: number,
    socialNetworkId: string,
  ): Promise<void> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.deleteSocialNetwork(socialNetworkId);
  }

  /**
   * Updates a social network in the user's profile.
   *
   * @param userId - The ID of the user.
   * @param socialNetworkId
   * @param url
   * @throws Error if the user is not found or the social network does not exist.
   */
  async updateSocialNetwork(
    userId: number,
    socialNetworkId: string,
    url: string,
  ): Promise<void> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }
    /// NOTE : Should check if user own this social network

    await this.influencerRepository.updateSocialNetwork(socialNetworkId, url);
  }

  async addLegalDocument(
    userId: number,
    type: LegalDocumentType,
    file: Express.Multer.File,
  ): Promise<void> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    const exists = await this.influencerRepository.getLegalDocumentByType(
      influencer.id,
      type,
    );

    if (exists) {
      await this.deleteLegalDocument(userId, type);
    }

    const document = await this.minioService.uploadFile(file, BucketType.legal);
    await this.influencerRepository.addLegalDocument(
      influencer.id,
      type,
      LegalDocumentStatus.pending,
      document,
    );
  }

  /**
   * Retrieves the status of a legal document for a specific influencer based on the document type.
   *
   * @param userId - The ID of the influencer whose legal document status is being retrieved.
   * @param type - The type of the legal document whose status is being checked (e.g., contract, agreement, etc.).
   *
   * @returns The status of the legal document. If no document exists for the given type,
   *          the status will be `LegalDocumentStatus.missing`.
   *
   * @throws {UserNotFoundException} If the influencer with the given `userId` is not found.
   */
  async getLegalDocumentStatus(
    userId: number,
    type: LegalDocumentType,
  ): Promise<LegalDocumentStatus> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    const document = await this.influencerRepository.getLegalDocumentByType(
      influencer.id,
      type,
    );

    if (!document) {
      return LegalDocumentStatus.missing;
    }

    return document.status;
  }

  /**
   * Deletes a legal document of a specific influencer based on the document ID and type.
   *
   * @param userId - The ID of the user (influencer) whose legal document is to be deleted.
   * @param type - The type of the legal document to be deleted (e.g., contract, agreement, etc.).
   *
   * @returns A promise that resolves when the document is deleted.
   * @throws {UserNotFoundException} If the influencer with the given `userId` is not found.
   * @throws {LegalDocumentNotFoundException} If no document with the specified `type` exists for the influencer.
   */
  async deleteLegalDocument(
    userId: number,
    type: LegalDocumentType,
  ): Promise<void> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    const document = await this.influencerRepository.getLegalDocumentByType(
      influencer.id,
      type,
    );

    if (!document) {
      // Exception missing.
      return;
    }
    await this.minioService.removeFile(BucketType.legal, document.document);
    await this.influencerRepository.deleteLegalDocument(document.id);
  }

  /**
   * Retrieves the account link for a specific influencer to complete their Stripe onboarding.
   *
   * @param userId - The ID of the user (influencer) whose Stripe account link is to be retrieved.
   *
   * @returns A promise that resolves with the URL of the Stripe account link.
   * @throws {UserNotFoundException} If the influencer with the given `userId` is not found.
   */
  async getStripeAccountLink(userId: number): Promise<string> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    const url = await this.stripeService.createAccountLink(
      influencer.stripeAccountId,
    );

    return url;
  }
  /**
   * Generates a secure login link to the influencer's Stripe Express dashboard.
   * This link allows the user to update their payout details, personal information,
   * and view payment activity.
   *
   * @param userId - The ID of the user requesting the login link.
   * @returns A URL to the Stripe Express dashboard.
   * @throws UserNotFoundException - If the influencer does not exist in the database.
   */
  async createLoginLink(userId: number): Promise<string> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    const url = await this.stripeService.createLoginLink(
      influencer.stripeAccountId,
    );

    return url;
  }

  /**
   * Checks whether the influencer has completed all required legal documents.
   *
   * @param userId - The ID of the user (influencer) to check.
   * @returns `true` if all required documents have been submitted and validated, otherwise `false`.
   * @throws `UserNotFoundException` if the influencer does not exist.
   */
  async hasCompletedDocuments(userId: number): Promise<boolean> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    const completed =
      await this.influencerRepository.hasCompletedLegalDocuments(
        influencer.id,
        [LegalDocumentType.debug],
      );
    return completed;
  }

  /**
   * Checks whether the influencer has completed their Stripe onboarding process.
   *
   * @param userId - The ID of the user (influencer) to check.
   * @returns `true` if the associated Stripe account is fully set up, otherwise `false`.
   * @throws `UserNotFoundException` if the influencer does not exist.
   */
  async hasCompletedStripe(userId: number): Promise<boolean> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    const completed = await this.stripeService.isAccountCompleted(
      influencer.stripeAccountId,
    );
    return completed;
  }

  async getInfluencer(userId: number): Promise<InfluencerEntity> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async hasCompletedInstagram(userId: number): Promise<any> {
    const company = await this.influencerRepository.getInfluencer(userId);
    if (!company) {
      throw new UserNotFoundException();
    }

    let oauth = await this.facebookRepository.getInstagramAccount(userId);

    if (!oauth) {
      return false;
    }
    return true;
  }

  async getProfileCompletionStatus(
    userId: number,
  ): Promise<InfluencerProfileCompletionStatusEntity> {
    const influencer = await this.influencerRepository.getInfluencer(userId);
    if (!influencer) {
      throw new UserNotFoundException();
    }

    const socialNetworks = await this.influencerRepository.getSocialNetworks(
      influencer.id,
    );

    const profileCompletionStatus = new InfluencerProfileCompletionStatusEntity(
      {
        hasProfilePicture: !!influencer.profilePicture,
        hasPortfolio: influencer.portfolio.length > 0,
        hasName: !!influencer.name,
        hasDescription: !!influencer.description,
        hasDepartment: !!influencer.department,
        hasSocialNetworks: socialNetworks.length > 0,
        hasThemes: influencer.themes.length > 0,
        hasTargetAudience: influencer.targetAudience.length > 0,
        hasLegalDocuments: await this.hasCompletedDocuments(userId),
        hasStripeCompleted: await this.stripeService.isAccountCompleted(
          influencer.stripeAccountId,
        ),
        hasInstagramAccount: await this.hasCompletedInstagram(userId),
      },
    );

    return profileCompletionStatus;
  }

  async hasCompletedProfile(userId: number): Promise<boolean> {
    const profileCompletionStatus =
      await this.getProfileCompletionStatus(userId);
    return (
      profileCompletionStatus.hasProfilePicture &&
      profileCompletionStatus.hasName &&
      profileCompletionStatus.hasDescription &&
      profileCompletionStatus.hasDepartment &&
      profileCompletionStatus.hasSocialNetworks &&
      profileCompletionStatus.hasLegalDocuments &&
      profileCompletionStatus.hasPortfolio &&
      profileCompletionStatus.hasThemes &&
      profileCompletionStatus.hasTargetAudience &&
      profileCompletionStatus.hasStripeCompleted &&
      profileCompletionStatus.hasInstagramAccount
    );
  }

  async incrementProfileViews(userId: number): Promise<void> {
    await this.influencerRepository.incrementProfileViews(userId);
  }

  async getStatistics(userId: number): Promise<InfluencerStatisticsEntity> {
    let s = await this.influencerRepository.getStatistics(userId);
    return s;
  }
}
