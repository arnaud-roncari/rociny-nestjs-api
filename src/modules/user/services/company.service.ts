import { Injectable } from '@nestjs/common';
import { FileRequiredException } from 'src/commons/errors/file-required';
import { UserNotFoundException } from 'src/commons/errors/user-not-found';
import { MinioService } from 'src/modules/minio/minio.service';
import { BucketType } from 'src/commons/enums/bucket_type';
import internal from 'stream';
import { PlatformType } from 'src/commons/enums/platform_type';
import { SocialNetworkEntity } from '../entities/social_network.entity';
import { SocialNetworkExists } from 'src/commons/errors/social-network-already-exist';
import { LegalDocumentType } from 'src/commons/enums/legal_document_type';
import { LegalDocumentAlreadyExists } from 'src/commons/errors/legal-document-already-exist';
import { LegalDocumentStatus } from 'src/commons/enums/legal_document_status';
import { CompanyRepository } from '../repositories/company.repository';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { CompanyEntity } from '../entities/company.entity';
import Stripe from 'stripe';
import { FacebookRepository } from 'src/modules/facebook/facebook.repository';
import { CompanyProfileCompletionStatusEntity } from '../entities/company_profile_completion_status.entity';
import { InfluencerSummary } from '../entities/influencer_summary.entity';
import { InfluencerRepository } from '../repositories/influencer.repository';
import { SearchInfluencersByFiltersDto } from '../dtos/search-influencers-by-filters.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly influencerRepository: InfluencerRepository,
    private readonly facebookRepository: FacebookRepository,
    private readonly minioService: MinioService,
    private readonly stripeService: StripeService,
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

    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // Keep reference to previous profile pictore, to be deleted later
    const oldProfilePicture = user.profilePicture;

    // Upload new profile picture
    const newProfilePicture = await this.minioService.uploadFile(
      file,
      BucketType.company_pictures,
    );

    // Update user
    await this.companyRepository.updateProfilePicture(
      userId,
      newProfilePicture,
    );

    /// Delete previous profile picture
    if (oldProfilePicture) {
      await this.minioService.removeFile(
        BucketType.company_pictures,
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
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const file = await this.minioService.getFile(
      BucketType.company_pictures,
      user.profilePicture,
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
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.companyRepository.updateName(userId, name);
  }

  /**
   * Updates the description of the user.
   *
   * @param userId - The ID of the user whose description is being updated.
   * @param description - The new description for the user.
   * @throws Error if the user is not found.
   */
  async updateDescription(userId: number, description: string): Promise<void> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.companyRepository.updateDescription(userId, description);
  }

  /**
   * Updates the department of the user.
   *
   * @param userId - The ID of the user whose department is being updated.
   * @param department - The new department for the user.
   * @throws Error if the user is not found.
   */
  async updateDepartment(userId: number, department: string): Promise<void> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.companyRepository.updateDepartment(userId, department);
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
    const company = await this.companyRepository.getCompany(userId);
    if (!company) {
      throw new UserNotFoundException();
    }

    const exists = await this.companyRepository.getSocialNetworkByType(
      company.id,
      platform,
    );

    if (exists) {
      throw new SocialNetworkExists();
    }

    await this.companyRepository.createSocialNetwork(
      company.id,
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
    const company = await this.companyRepository.getCompany(userId);
    if (!company) {
      throw new UserNotFoundException();
    }

    const sn = await this.companyRepository.getSocialNetworks(company.id);
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
    const company = await this.companyRepository.getCompany(userId);
    if (!company) {
      throw new UserNotFoundException();
    }

    await this.companyRepository.deleteSocialNetwork(socialNetworkId);
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
    const company = await this.companyRepository.getCompany(userId);
    if (!company) {
      throw new UserNotFoundException();
    }
    /// NOTE : Should check if user own this social network

    await this.companyRepository.updateSocialNetwork(socialNetworkId, url);
  }

  async addLegalDocument(
    userId: number,
    type: LegalDocumentType,
    file: Express.Multer.File,
  ): Promise<void> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const exists = await this.companyRepository.getLegalDocumentByType(
      user.id,
      type,
    );
    if (exists) {
      throw new LegalDocumentAlreadyExists();
    }

    const document = await this.minioService.uploadFile(file, BucketType.legal);
    await this.companyRepository.addLegalDocument(
      user.id,
      type,
      LegalDocumentStatus.pending,
      document,
    );
  }

  /**
   * Retrieves the status of a legal document for a specific company based on the document type.
   *
   * @param userId - The ID of the company whose legal document status is being retrieved.
   * @param type - The type of the legal document whose status is being checked (e.g., contract, agreement, etc.).
   *
   * @returns The status of the legal document. If no document exists for the given type,
   *          the status will be `LegalDocumentStatus.missing`.
   *
   * @throws {UserNotFoundException} If the company with the given `userId` is not found.
   */
  async getLegalDocumentStatus(
    userId: number,
    type: LegalDocumentType,
  ): Promise<LegalDocumentStatus> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const document = await this.companyRepository.getLegalDocumentByType(
      user.id,
      type,
    );

    if (!document) {
      return LegalDocumentStatus.missing;
    }

    return document.status;
  }

  /**
   * Deletes a legal document of a specific company based on the document ID and type.
   *
   * @param userId - The ID of the user (company) whose legal document is to be deleted.
   * @param type - The type of the legal document to be deleted (e.g., contract, agreement, etc.).
   *
   * @returns A promise that resolves when the document is deleted.
   * @throws {UserNotFoundException} If the company with the given `userId` is not found.
   * @throws {LegalDocumentNotFoundException} If no document with the specified `type` exists for the company.
   */
  async deleteLegalDocument(
    userId: number,
    type: LegalDocumentType,
  ): Promise<void> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const document = await this.companyRepository.getLegalDocumentByType(
      user.id,
      type,
    );

    if (!document) {
      // Exception missing.
      return;
    }
    await this.minioService.removeFile(BucketType.legal, document.document);
    await this.companyRepository.deleteLegalDocument(document.id);
  }

  /**
   * Creates a SetupIntent for a specific company to allow them to save a payment method.
   *
   * @param userId - The ID of the company for which the SetupIntent is to be created.
   *
   * @returns A promise that resolves with the created SetupIntent.
   * @throws {UserNotFoundException} If the company with the given `userId` is not found.
   */
  async createSetupIntent(userId: number): Promise<Stripe.SetupIntent> {
    // Fetch the company by userId to retrieve the Stripe customer ID
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      // If the company does not exist, throw an error
      throw new UserNotFoundException();
    }

    // Create a SetupIntent with the Stripe customer ID to allow payment method saving
    const setupIntent = await this.stripeService.createSetupIntent(
      user.stripeCustomerId,
    );

    return setupIntent;
  }

  /**
   * Retrieves the company entity associated with a given user.
   *
   * @param {string} userId - The unique identifier of the user.
   * @returns {Promise<CompanyEntity>} - The company entity linked to the user.
   * @throws {UserNotFoundException} - Thrown if no user is found with the given ID.
   */
  async getCompany(userId: number): Promise<CompanyEntity> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  /**
   * Creates an Ephemeral Key for a specific company to authorize temporary access to Stripe Customer resources from the mobile frontend.
   *
   * @param userId - The ID of the company for which the Ephemeral Key is to be created.
   *
   * @returns A promise that resolves with the secret of the created Ephemeral Key.
   * @throws {UserNotFoundException} If the company with the given `userId` is not found.
   * @throws {StripeError} If the Ephemeral Key creation fails.
   */
  async createEphemeralKey(userId: number): Promise<Stripe.EphemeralKey> {
    // Fetch the company to retrieve the Stripe customer ID
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      // If the company does not exist, throw an error
      throw new UserNotFoundException();
    }

    // Create an Ephemeral Key for the specified Stripe customer
    const ephemeralKey = await this.stripeService.createEphemeralKey(
      user.stripeCustomerId,
    );

    return ephemeralKey;
  }

  async hasCompletedDocuments(userId: number): Promise<boolean> {
    const company = await this.companyRepository.getCompany(userId);
    if (!company) {
      throw new UserNotFoundException();
    }

    const completed = await this.companyRepository.hasCompletedLegalDocuments(
      company.id,
      [LegalDocumentType.debug],
    );
    return completed;
  }

  async hasCompletedStripe(userId: number): Promise<boolean> {
    const company = await this.companyRepository.getCompany(userId);
    if (!company) {
      throw new UserNotFoundException();
    }

    const completed = await this.stripeService.hasCardPaymentMethod(
      company.stripeCustomerId,
    );
    return completed;
  }

  async createBillingPortalSession(userId: number): Promise<string> {
    // Fetch the company to retrieve the Stripe customer ID
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      // If the company does not exist, throw an error
      throw new UserNotFoundException();
    }

    // Create an Ephemeral Key for the specified Stripe customer
    const url = await this.stripeService.createBillingPortalSession(
      user.stripeCustomerId,
    );

    return url;
  }

  async hasCompletedInstagram(userId: number): Promise<any> {
    const company = await this.companyRepository.getCompany(userId);
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
  ): Promise<CompanyProfileCompletionStatusEntity> {
    const company = await this.companyRepository.getCompany(userId);
    if (!company) {
      throw new UserNotFoundException();
    }

    const socialNetworks = await this.companyRepository.getSocialNetworks(
      company.id,
    );

    const profileCompletionStatus = new CompanyProfileCompletionStatusEntity({
      hasProfilePicture: !!company.profilePicture,
      hasName: !!company.name,
      hasDescription: !!company.description,
      hasDepartment: !!company.department,
      hasSocialNetworks: socialNetworks.length > 0,
      hasLegalDocuments: await this.hasCompletedDocuments(userId),
      hasStripePaymentMethod: await this.hasCompletedStripe(userId),
      hasInstagramAccount: await this.hasCompletedInstagram(userId),
    });

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
      profileCompletionStatus.hasStripePaymentMethod &&
      profileCompletionStatus.hasInstagramAccount
    );
  }

  async searchInfluencersByTheme(
    theme: string | null,
  ): Promise<InfluencerSummary[]> {
    let influencers =
      await this.influencerRepository.searchInfluencersByTheme(theme);
    return influencers;
  }

  async searchInfluencersByFilters(
    filters: SearchInfluencersByFiltersDto,
  ): Promise<InfluencerSummary[]> {
    let influencers =
      await this.influencerRepository.searchInfluencersByFilters(
        filters.themes,
        filters.departments,
        filters.ages,
        filters.targets,
        filters.followers_range,
        filters.engagement_rate_range,
      );
    return influencers;
  }
}
