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
   * Uploads and sets a new profile picture for an influencer.
   * - Deletes the previous one if it exists.
   *
   * @param userId - Influencer user ID.
   * @param file - Uploaded file.
   * @returns The new profile picture filename.
   * @throws FileRequiredException if no file provided.
   * @throws UserNotFoundException if user does not exist.
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

    const oldProfilePicture = user.profilePicture;

    const newProfilePicture = await this.minioService.uploadFile(
      file,
      BucketType.influencer_pictures,
    );

    await this.influencerRepository.updateProfilePicture(
      userId,
      newProfilePicture,
    );

    if (oldProfilePicture) {
      await this.minioService.removeFile(
        BucketType.influencer_pictures,
        oldProfilePicture,
      );
    }

    return newProfilePicture;
  }

  /**
   * Replaces the entire portfolio of an influencer.
   * - Deletes old portfolio files.
   *
   * @param userId - Influencer user ID.
   * @param files - Uploaded portfolio files.
   * @returns Array of new portfolio file names.
   * @throws FileRequiredException if no files provided.
   * @throws UserNotFoundException if user does not exist.
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

    const oldPortfolio = user.portfolio || [];

    const newPortfolio = await Promise.all(
      files.map((file) =>
        this.minioService.uploadFile(file, BucketType.portfolios),
      ),
    );

    await this.influencerRepository.updatePortfolio(userId, newPortfolio);

    await Promise.all(
      oldPortfolio.map((file) =>
        this.minioService.removeFile(BucketType.portfolios, file),
      ),
    );

    return newPortfolio;
  }

  /**
   * Adds pictures to an influencer's existing portfolio.
   *
   * @param userId - Influencer user ID.
   * @param files - New files to add.
   * @throws FileRequiredException if no files provided.
   * @throws UserNotFoundException if user does not exist.
   */
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

  /**
   * Removes a specific picture from an influencer's portfolio.
   *
   * @param userId - Influencer user ID.
   * @param pictureUrl - Picture filename.
   * @throws UserNotFoundException if user does not exist.
   */
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
   * Retrieves an influencer's profile picture by filename.
   *
   * @param filename - Picture filename.
   * @returns Readable file stream.
   */
  async getProfilePictureByFilename(
    filename: string,
  ): Promise<internal.Readable> {
    const file = await this.minioService.getFile(
      BucketType.influencer_pictures,
      filename,
    );

    return file;
  }

  /**
   * Retrieves a portfolio file by name.
   *
   * @param userId - Influencer user ID.
   * @param fileName - Portfolio file name.
   * @returns Readable file stream.
   * @throws FileNotFoundException if file not found in portfolio.
   */
  async getPortfolio(fileName: string): Promise<internal.Readable> {
    const file = await this.minioService.getFile(
      BucketType.portfolios,
      fileName,
    );

    return file;
  }

  /**
   * Updates influencer name.
   *
   * @param userId - Influencer user ID.
   * @param name - New name.
   * @throws UserNotFoundException if user does not exist.
   */
  async updateName(userId: number, name: string): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.updateName(userId, name);
  }

  /**
   * Updates VAT number and syncs with Stripe.
   *
   * @param userId - Influencer user ID.
   * @param vatNumber - VAT number.
   * @throws UserNotFoundException if user does not exist.
   */
  async updateVATNumber(userId: number, vatNumber: string): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    console.log(vatNumber);
    await this.stripeService.setConnectedVat(user.stripeAccountId, vatNumber);
    await this.influencerRepository.updateVATNumber(userId, vatNumber);
  }

  /**
   * Updates influencer description.
   *
   * @param userId - Influencer user ID.
   * @param description - New description.
   * @throws UserNotFoundException if user does not exist.
   */
  async updateDescription(userId: number, description: string): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.updateDescription(userId, description);
  }

  /**
   * Updates influencer department.
   *
   * @param userId - Influencer user ID.
   * @param department - New department.
   * @throws UserNotFoundException if user does not exist.
   */
  async updateDepartment(userId: number, department: string): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.updateDepartment(userId, department);
  }

  /**
   * Updates influencer themes.
   *
   * @param userId - Influencer user ID.
   * @param themes - New themes.
   * @throws UserNotFoundException if user does not exist.
   */
  async updateThemes(userId: number, themes: string[]): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.updateThemes(userId, themes);
  }

  /**
   * Updates influencer target audience.
   *
   * @param userId - Influencer user ID.
   * @param targetAudience - Target audience array.
   * @throws UserNotFoundException if user does not exist.
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
   * Adds a new social network to influencer profile.
   *
   * @param userId - Influencer user ID.
   * @param platform - Platform type.
   * @param url - Social network URL.
   * @throws SocialNetworkExists if platform already added.
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
   * Retrieves all influencer social networks.
   *
   * @param userId - Influencer user ID.
   * @returns List of social networks.
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
   * Deletes an influencer's social network by ID.
   *
   * @param userId - Influencer user ID.
   * @param socialNetworkId - Social network ID.
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
   * Updates influencer social network URL.
   *
   * @param userId - Influencer user ID.
   * @param socialNetworkId - Social network ID.
   * @param url - New URL.
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

    await this.influencerRepository.updateSocialNetwork(socialNetworkId, url);
  }

  /**
   * Uploads and adds a new legal document.
   * - If a document of same type exists, deletes it first.
   *
   * @param userId - Influencer user ID.
   * @param type - Document type.
   * @param file - File to upload.
   */
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
   * Retrieves legal document status by type.
   *
   * @param userId - Influencer user ID.
   * @param type - Document type.
   * @returns LegalDocumentStatus.
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
   * Deletes a legal document by type.
   *
   * @param userId - Influencer user ID.
   * @param type - Document type.
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
      return;
    }
    await this.minioService.removeFile(BucketType.legal, document.document);
    await this.influencerRepository.deleteLegalDocument(document.id);
  }

  /**
   * Creates a Stripe onboarding account link for influencer.
   *
   * @param userId - Influencer user ID.
   * @returns Stripe account link URL.
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
   * Generates a login link to Stripe Express dashboard.
   *
   * @param userId - Influencer user ID.
   * @returns Stripe login link URL.
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
   * Checks if influencer completed all legal documents.
   *
   * @param userId - Influencer user ID.
   * @returns true if completed.
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
   * Checks if influencer completed Stripe onboarding.
   *
   * @param userId - Influencer user ID.
   * @returns true if completed.
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

  /**
   * Retrieves influencer entity by ID.
   *
   * @param userId - Influencer user ID.
   * @returns InfluencerEntity.
   */
  async getInfluencer(userId: number): Promise<InfluencerEntity> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  /**
   * Checks if influencer has a linked Instagram account.
   *
   * @param userId - Influencer user ID.
   * @returns true if exists, false otherwise.
   */
  async hasCompletedInstagram(userId: number): Promise<any> {
    const company = await this.influencerRepository.getInfluencer(userId);
    if (!company) {
      throw new UserNotFoundException();
    }

    const oauth = await this.facebookRepository.getInstagramAccount(userId);

    if (!oauth) {
      return false;
    }
    return true;
  }

  /**
   * Computes influencer profile completion status.
   *
   * @param userId - Influencer user ID.
   * @returns InfluencerProfileCompletionStatusEntity.
   */
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

  /**
   * Checks if influencer profile is fully completed.
   *
   * @param userId - Influencer user ID.
   * @returns true if all required fields and validations are satisfied.
   */
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

  /**
   * Increments the influencer's profile view counter.
   *
   * @param userId - Influencer user ID.
   */
  async incrementProfileViews(userId: number): Promise<void> {
    await this.influencerRepository.incrementProfileViews(userId);
  }

  /**
   * Retrieves influencer statistics for dashboard.
   *
   * @param userId - Influencer user ID.
   * @returns InfluencerStatisticsEntity.
   */
  async getStatistics(userId: number): Promise<InfluencerStatisticsEntity> {
    const s = await this.influencerRepository.getStatistics(userId);
    return s;
  }
}
