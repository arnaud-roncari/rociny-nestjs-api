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
   * Uploads a new profile picture for the company.
   * - Removes the previous profile picture if it exists.
   * - Stores the new picture in Minio.
   *
   * @param userId - Company user ID.
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

    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const oldProfilePicture = user.profilePicture;

    const newProfilePicture = await this.minioService.uploadFile(
      file,
      BucketType.company_pictures,
    );

    await this.companyRepository.updateProfilePicture(
      userId,
      newProfilePicture,
    );

    if (oldProfilePicture) {
      await this.minioService.removeFile(
        BucketType.company_pictures,
        oldProfilePicture,
      );
    }

    return newProfilePicture;
  }

  /**
   * Retrieves a company profile picture by filename.
   *
   * @param filename - File name in storage.
   * @returns Readable stream of the file.
   */
  async getProfilePictureByFilename(
    filename: string,
  ): Promise<internal.Readable> {
    const file = await this.minioService.getFile(
      BucketType.company_pictures,
      filename,
    );

    return file;
  }

  /**
   * Updates the company name.
   *
   * @param userId - Company user ID.
   * @param name - New company name.
   * @throws UserNotFoundException if company does not exist.
   */
  async updateName(userId: number, name: string): Promise<void> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.companyRepository.updateName(userId, name);
  }

  /**
   * Updates the company trade name.
   * Also updates the trade name in Stripe.
   *
   * @param userId - Company user ID.
   * @param tradeName - New trade name.
   * @throws UserNotFoundException if company does not exist.
   */
  async updateTradeName(userId: number, tradeName: string): Promise<void> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.stripeService.setCustomerTradeName(
      user.stripeCustomerId,
      tradeName,
    );
    await this.companyRepository.updateTradeName(userId, tradeName);
  }

  /**
   * Updates the billing address of the company.
   * Also syncs address with Stripe.
   *
   * @param userId - Company user ID.
   * @param city - City.
   * @param street - Street.
   * @param postalCode - Postal code.
   * @throws UserNotFoundException if company does not exist.
   */
  async updateBillingAddress(
    userId: number,
    city: string,
    street: string,
    postalCode: string,
  ): Promise<void> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.stripeService.setCustomerBillingAddress(
      user.stripeCustomerId,
      city,
      street,
      postalCode,
    );
    await this.companyRepository.updateBillingAddress(
      userId,
      city,
      street,
      postalCode,
    );
  }

  /**
   * Updates the VAT number of the company.
   * Also syncs VAT number with Stripe.
   *
   * @param userId - Company user ID.
   * @param vatNumber - VAT number.
   * @throws UserNotFoundException if company does not exist.
   */
  async updateVATNumber(userId: number, vatNumber: string): Promise<void> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.stripeService.setCustomerVat(user.stripeCustomerId, vatNumber);
    await this.companyRepository.updateVATNumber(userId, vatNumber);
  }

  /**
   * Updates the company description.
   *
   * @param userId - Company user ID.
   * @param description - New description.
   * @throws UserNotFoundException if company does not exist.
   */
  async updateDescription(userId: number, description: string): Promise<void> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.companyRepository.updateDescription(userId, description);
  }

  /**
   * Updates the company department.
   *
   * @param userId - Company user ID.
   * @param department - New department.
   * @throws UserNotFoundException if company does not exist.
   */
  async updateDepartment(userId: number, department: string): Promise<void> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.companyRepository.updateDepartment(userId, department);
  }

  /**
   * Adds a new social network to the company.
   *
   * @param userId - Company user ID.
   * @param platform - Social network platform type.
   * @param url - Profile URL.
   * @throws UserNotFoundException if company does not exist.
   * @throws SocialNetworkExists if the same platform already exists.
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
   * Retrieves all social networks of a company.
   *
   * @param userId - Company user ID.
   * @returns List of social networks.
   * @throws UserNotFoundException if company does not exist.
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
   * Deletes a social network by ID.
   *
   * @param userId - Company user ID.
   * @param socialNetworkId - Social network ID.
   * @throws UserNotFoundException if company does not exist.
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
   * Updates a social network URL.
   *
   * @param userId - Company user ID.
   * @param socialNetworkId - Social network ID.
   * @param url - New URL.
   * @throws UserNotFoundException if company does not exist.
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

    await this.companyRepository.updateSocialNetwork(socialNetworkId, url);
  }

  /**
   * Adds a new legal document for the company.
   *
   * @param userId - Company user ID.
   * @param type - Document type.
   * @param file - File to upload.
   * @throws UserNotFoundException if company does not exist.
   * @throws LegalDocumentAlreadyExists if a document of this type already exists.
   */
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
   * Gets the legal document status of a company for a given type.
   *
   * @param userId - Company user ID.
   * @param type - Document type.
   * @returns LegalDocumentStatus.
   * @throws UserNotFoundException if company does not exist.
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
   * Deletes a legal document by type.
   *
   * @param userId - Company user ID.
   * @param type - Document type.
   * @throws UserNotFoundException if company does not exist.
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
      return;
    }
    await this.minioService.removeFile(BucketType.legal, document.document);
    await this.companyRepository.deleteLegalDocument(document.id);
  }

  /**
   * Creates a Stripe SetupIntent for saving payment methods.
   *
   * @param userId - Company user ID.
   * @returns Stripe SetupIntent.
   * @throws UserNotFoundException if company does not exist.
   */
  async createSetupIntent(userId: number): Promise<Stripe.SetupIntent> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const setupIntent = await this.stripeService.createSetupIntent(
      user.stripeCustomerId,
    );

    return setupIntent;
  }

  /**
   * Retrieves the company entity.
   *
   * @param userId - Company user ID.
   * @returns CompanyEntity.
   * @throws UserNotFoundException if company does not exist.
   */
  async getCompany(userId: number): Promise<CompanyEntity> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  /**
   * Creates a Stripe Ephemeral Key.
   *
   * @param userId - Company user ID.
   * @returns Stripe EphemeralKey.
   * @throws UserNotFoundException if company does not exist.
   */
  async createEphemeralKey(userId: number): Promise<Stripe.EphemeralKey> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const ephemeralKey = await this.stripeService.createEphemeralKey(
      user.stripeCustomerId,
    );

    return ephemeralKey;
  }

  /**
   * Checks if the company has completed required legal documents.
   *
   * @param userId - Company user ID.
   * @returns true if completed, false otherwise.
   * @throws UserNotFoundException if company does not exist.
   */
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

  /**
   * Checks if the company has completed Stripe setup (payment method).
   *
   * @param userId - Company user ID.
   * @returns true if completed, false otherwise.
   * @throws UserNotFoundException if company does not exist.
   */
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

  /**
   * Creates a Stripe Billing Portal session URL.
   *
   * @param userId - Company user ID.
   * @returns URL string.
   * @throws UserNotFoundException if company does not exist.
   */
  async createBillingPortalSession(userId: number): Promise<string> {
    const user = await this.companyRepository.getCompany(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const url = await this.stripeService.createBillingPortalSession(
      user.stripeCustomerId,
    );

    return url;
  }

  /**
   * Checks if the company has a linked Instagram account.
   *
   * @param userId - Company user ID.
   * @returns true if linked, false otherwise.
   * @throws UserNotFoundException if company does not exist.
   */
  async hasCompletedInstagram(userId: number): Promise<any> {
    const company = await this.companyRepository.getCompany(userId);
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
   * Retrieves the company profile completion status.
   *
   * @param userId - Company user ID.
   * @returns CompanyProfileCompletionStatusEntity.
   * @throws UserNotFoundException if company does not exist.
   */
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
      hasTradeName: !!company.tradeName,
      hasBillingAddress:
        !!company.city && !!company.street && !!company.postalCode,
      hasSocialNetworks: socialNetworks.length > 0,
      hasLegalDocuments: await this.hasCompletedDocuments(userId),
      hasStripePaymentMethod: await this.hasCompletedStripe(userId),
      hasInstagramAccount: await this.hasCompletedInstagram(userId),
    });

    return profileCompletionStatus;
  }

  /**
   * Checks if the company profile is fully completed.
   *
   * @param userId - Company user ID.
   * @returns true if all required fields and verifications are present.
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
      profileCompletionStatus.hasStripePaymentMethod &&
      profileCompletionStatus.hasInstagramAccount &&
      profileCompletionStatus.hasBillingAddress &&
      profileCompletionStatus.hasTradeName
    );
  }

  /**
   * Searches influencers by theme.
   *
   * @param theme - Theme string or null.
   * @returns List of influencer summaries.
   */
  async searchInfluencersByTheme(
    theme: string | null,
  ): Promise<InfluencerSummary[]> {
    const influencers =
      await this.influencerRepository.searchInfluencersByTheme(theme);
    return influencers;
  }

  /**
   * Searches influencers by multiple filters.
   *
   * @param filters - Filter DTO including themes, departments, ages, etc.
   * @returns List of influencer summaries.
   */
  async searchInfluencersByFilters(
    filters: SearchInfluencersByFiltersDto,
  ): Promise<InfluencerSummary[]> {
    const influencers =
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
