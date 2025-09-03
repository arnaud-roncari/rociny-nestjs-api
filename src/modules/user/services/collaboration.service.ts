import { Injectable } from '@nestjs/common';
import { CollaborationRepository } from '../repositories/collaboration.repository';
import { CreateCollaborationDto } from '../dtos/create-collaboration.dto';
import { CollaborationEntity } from '../entities/collaboration.entity';
import { CollaborationNotFoundException } from 'src/commons/errors/collaboration-not-found';
import { BucketType } from 'src/commons/enums/bucket_type';
import { MinioService } from 'src/modules/minio/minio.service';
import { FileRequiredException } from 'src/commons/errors/file-required';
import { CollaborationSummaryEntity } from '../entities/collaboration_summary.entity';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { InfluencerRepository } from '../repositories/influencer.repository';
import { ReviewEntity } from '../entities/review.entity';
import { CompanyRepository } from '../repositories/company.repository';
import { kCommission } from 'src/commons/constants';
import axios from 'axios';
import internal from 'stream';
import { ReviewSummaryEntity } from '../entities/review_summary.entity';
import { CollaboratedCompanyEntity } from '../entities/collaborated_company_entity';
import { InfluencerSummary } from '../entities/influencer_summary.entity';
import { ConversationService } from 'src/modules/conversation/conversation.service';
import { NotificationType } from 'src/modules/notification/constant';
import { NotificationService } from 'src/modules/notification/notification.service';

@Injectable()
export class CollaborationService {
  constructor(
    private readonly collaborationRepository: CollaborationRepository,
    private readonly minioService: MinioService,
    private readonly stripeService: StripeService,
    private readonly influencerRepository: InfluencerRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly conversationService: ConversationService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Creates a new collaboration with the default status 'draft'
   * and immediately generates Rociny & Influencer quotes.
   *
   * @param dto - The data used to create the collaboration.
   * @returns The created collaboration entity.
   */
  async createDraftCollaboration(
    dto: CreateCollaborationDto,
    companyId: number,
  ): Promise<CollaborationEntity> {
    const status = 'draft';
    const id = await this.collaborationRepository.createCollaboration(
      dto,
      companyId,
      status,
    );
    const collab = await this.collaborationRepository.findById(id);
    if (!collab) {
      throw new CollaborationNotFoundException();
    }

    // Generate draft quotes
    await this.generateAndStoreQuotes(collab);

    const c = await this.collaborationRepository.findById(id);

    return c;
  }

  /**
   * Creates a new collaboration with the default status 'sent_by_company'
   * and immediately generates Rociny & Influencer quotes.
   *
   * @param dto - The data used to create the collaboration.
   * @returns The created collaboration entity.
   */
  async createCollaboration(
    dto: CreateCollaborationDto,
    companyUserId: number,
  ): Promise<CollaborationEntity> {
    const status = 'sent_by_company';
    const id = await this.collaborationRepository.createCollaboration(
      dto,
      companyUserId,
      status,
    );
    const collab = await this.collaborationRepository.findById(id);
    if (!collab) {
      throw new CollaborationNotFoundException();
    }

    // Generate draft quotes
    await this.generateAndStoreQuotes(collab);

    const c = await this.collaborationRepository.findById(collab.id);

    const company = await this.companyRepository.getCompanyById(companyUserId);
    const influencer = await this.influencerRepository.getInfluencerById(
      collab.influencerId,
    );
    const conversationExist = await this.conversationService.conversationExists(
      influencer.id,
      company.id,
    );
    if (conversationExist) {
      await this.conversationService.addMessage(
        conversationExist.id,
        'company',
        company.id,
        null,
        collab.id,
      );
    } else {
      await this.conversationService.createConversation(
        influencer.id,
        company.id,
        collab.id,
      );
    }

    await this.notificationService.send(
      influencer.userId,
      NotificationType.collaboration_sent_by_company,
    );

    return c;
  }

  /**
   * Helper to generate Rociny & Influencer quotes and store them in DB.
   */
  private async generateAndStoreQuotes(
    collab: CollaborationEntity,
  ): Promise<void> {
    const [influencerData, company] = await Promise.all([
      this.influencerRepository.getInfluencerById(collab.influencerId),
      this.companyRepository.getCompanyById(collab.companyId),
    ]);

    const baseAmount = collab.getPrice();
    const commission = baseAmount * kCommission;

    // Create quotes
    const [platformQuote, influencerQuote] = await Promise.all([
      this.stripeService.createPlatformInvoice(
        company.stripeCustomerId,
        commission,
        true, // isQuote
      ),
      this.stripeService.createInfluencerInvoice(
        company,
        influencerData,
        collab.productPlacements,
        true, // isQuote
      ),
    ]);

    // Download PDFs
    const [platformQuotePdf, influencerQuotePdf] = await Promise.all([
      axios.get<ArrayBuffer>(platformQuote.pdf, {
        responseType: 'arraybuffer',
      }),
      axios.get<ArrayBuffer>(influencerQuote.pdf, {
        responseType: 'arraybuffer',
      }),
    ]);

    // Store PDFs in Minio
    const [PQName, IQName] = await Promise.all([
      this.minioService.uploadBuffer(
        Buffer.from(platformQuotePdf.data),
        platformQuote.id,
        BucketType.invoices,
      ),
      this.minioService.uploadBuffer(
        Buffer.from(influencerQuotePdf.data),
        influencerQuote.id,
        BucketType.invoices,
      ),
    ]);

    // Update DB with quote references
    await this.collaborationRepository.updateCollaborationQuotes(
      collab.id,
      PQName,
      IQName,
    );
  }

  /**
   * Retrieves a single collaboration by its ID.
   *
   * @param id - The ID of the collaboration.
   * @returns The collaboration entity.
   */
  async getCollaboration(id: number): Promise<CollaborationEntity> {
    const collab = await this.collaborationRepository.findById(id);
    if (!collab) {
      throw new CollaborationNotFoundException();
    }
    return collab;
  }

  /**
   * Retrieves all collaborations associated with a company.
   *
   * @param companyId - The ID of the company.
   * @returns A list of collaborations.
   */
  async getCollaborationsByCompany(
    companyId: number,
  ): Promise<CollaborationEntity[]> {
    return this.collaborationRepository.findByCompany(companyId);
  }

  /**
   * Retrieves all collaborations associated with an influencer.
   *
   * @param influencerId - The ID of the influencer.
   * @returns A list of collaborations.
   */
  async getCollaborationsByInfluencer(
    influencerId: number,
  ): Promise<CollaborationEntity[]> {
    return this.collaborationRepository.findByInfluencer(influencerId);
  }

  /**
   * Uploads multiple files to Minio and replaces the collaboration's files[] with the new ones.
   * @param collabId - The ID of the collaboration.
   * @param files - Array of uploaded files.
   * @returns The list of uploaded file URLs.
   */
  async uploadCollaborationFiles(
    collabId: number,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new FileRequiredException();
    }

    const uploadedFiles: string[] = [];

    for (const file of files) {
      const uploaded = await this.minioService.uploadFile(
        file,
        BucketType.collaborations,
      );
      uploadedFiles.push(uploaded);
    }

    await this.collaborationRepository.updateCollaborationFiles(
      collabId,
      uploadedFiles,
    );

    return uploadedFiles;
  }

  async getSummariesByCompany(
    companyId: number,
  ): Promise<CollaborationSummaryEntity[]> {
    return this.collaborationRepository.getSummariesByCompany(companyId);
  }

  async getSummariesByInfluencer(
    influencerId: number,
  ): Promise<CollaborationSummaryEntity[]> {
    const r =
      await this.collaborationRepository.getSummariesByInfluencer(influencerId);
    return r;
  }

  async cancelCollaboration(collaborationId: number): Promise<void> {
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'canceled_by_company',
    );

    const c = await this.collaborationRepository.findById(collaborationId);
    const influencer = await this.influencerRepository.getInfluencerById(
      c.influencerId,
    );

    await this.notificationService.send(
      influencer.userId,
      NotificationType.collaboration_canceled_by_company,
    );
  }

  async sendDraftCollaboration(collaborationId: number): Promise<void> {
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'sent_by_company',
    );

    const collab = await this.collaborationRepository.findById(collaborationId);
    const company = await this.companyRepository.getCompanyById(
      collab.companyId,
    );
    const influencer = await this.influencerRepository.getInfluencerById(
      collab.influencerId,
    );

    const conversationExist = await this.conversationService.conversationExists(
      influencer.id,
      company.id,
    );
    if (conversationExist) {
      await this.conversationService.addMessage(
        conversationExist.id,
        'company',
        company.id,
        null,
        collab.id,
      );
    } else {
      await this.conversationService.createConversation(
        influencer.id,
        company.id,
        collab.id,
      );
    }

    await this.notificationService.send(
      influencer.userId,
      NotificationType.collaboration_sent_by_company,
    );
  }

  /**
   * Initiates payment for a collaboration between a company and an influencer.
   * Calculates commission, VAT, and total amount before creating a PaymentIntent.
   *
   * @param userId - The ID of the user (company representative) initiating payment.
   * @param collaborationId - The ID of the collaboration to fund.
   * @returns The Stripe PaymentIntent client secret to be used by the frontend.
   */
  async supplyCollaboration(
    userId: number,
    collaborationId: number,
  ): Promise<any> {
    // Retrieve collaboration details from DB
    const collaboration =
      await this.collaborationRepository.findById(collaborationId);

    // Retrieve the paying company details
    const company = await this.companyRepository.getCompany(userId);

    // Retrieve influencer details
    const influencer = await this.influencerRepository.getInfluencerById(
      collaboration.influencerId,
    );

    // Determine if influencer has a VAT number
    const hasInfluencerVAT = influencer.vatNumber !== null;

    // Collaboration base price (without commission or VAT)
    const price = collaboration.getPrice();

    // Commission for Rociny (percentage of price)
    const commission = price * kCommission;

    // Rociny's VAT (20% of commission)
    const rocinyVat = commission * 0.2;

    // Influencer's VAT (20% of price) if applicable
    const influencerVat = hasInfluencerVAT ? price * 0.2 : 0;

    // Final total = base price + influencer VAT + Rociny commission + Rociny VAT
    const total = price + influencerVat + commission + rocinyVat;

    // Get Stripe customer ID for the company
    const customerId = company.stripeCustomerId;

    // Create PaymentIntent on Stripe for the total amount
    const paymentIntent = await this.stripeService.createPaymentIntent(
      collaborationId,
      total,
      customerId,
    );

    // Return the client secret for frontend to complete payment
    return {
      clientSecret: paymentIntent.clientSecret,
      ephemeralKey: paymentIntent.ephemeralKey,
    };
  }

  async collaborationSupplied(collaborationId: number): Promise<void> {
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'in_progress',
    );

    const c = await this.collaborationRepository.findById(collaborationId);
    const company = await this.companyRepository.getCompanyById(c.companyId);
    const influencer = await this.influencerRepository.getInfluencerById(
      c.influencerId,
    );

    await this.notificationService.send(
      company.userId,
      NotificationType.collaboration_in_progress,
    );

    await this.notificationService.send(
      influencer.userId,
      NotificationType.collaboration_in_progress,
    );
  }

  /**
   * Validates a collaboration by:
   * 1. Transferring payment to the influencer
   * 2. Generating and storing both platform and influencer invoices
   * 3. Updating collaboration status and invoice references
   *
   * @param collaborationId - The ID of the collaboration to validate
   */
  async validateCollaboration(collaborationId: number): Promise<void> {
    // 1. Fetch collaboration, influencer, and company details in parallel
    const collaboration =
      await this.collaborationRepository.findById(collaborationId);

    const [influencerData, company] = await Promise.all([
      this.influencerRepository.getInfluencerById(collaboration.influencerId),
      this.companyRepository.getCompanyById(collaboration.companyId),
    ]);

    // 2. Calculate payment amounts
    const baseAmount = collaboration.getPrice();
    const commission = baseAmount * kCommission;

    const hasInfluencerVAT = influencerData.vatNumber !== null;
    const totalInfluencerAmount = hasInfluencerVAT
      ? baseAmount * 1.2 // Adds 20% VAT
      : baseAmount;

    // 3. Transfer payment to influencer (async, no dependency on invoices)
    const transferPromise = this.stripeService.transferToInfluencer(
      influencerData.stripeAccountId,
      totalInfluencerAmount,
      collaborationId,
    );

    // 4. Create platform invoice (commission charged to company)
    const platformInvoicePromise = this.stripeService.createPlatformInvoice(
      company.stripeCustomerId,
      commission,
    );

    // 5. Create influencer invoice (for the company, from the influencer)
    const influencerInvoicePromise = this.stripeService.createInfluencerInvoice(
      company,
      influencerData,
      collaboration.productPlacements,
    );

    // Wait for invoices and transfer to be completed
    const [_, platformInvoice, influencerInvoice] = await Promise.all([
      transferPromise,
      platformInvoicePromise,
      influencerInvoicePromise,
    ]);

    // 6. Download invoice PDFs in parallel
    const [platformInvoicePdf, influencerInvoicePdf] = await Promise.all([
      axios.get<ArrayBuffer>(platformInvoice.pdf, {
        responseType: 'arraybuffer',
      }),
      axios.get<ArrayBuffer>(influencerInvoice.pdf, {
        responseType: 'arraybuffer',
      }),
    ]);

    // 7. Store invoices in Minio in parallel
    const [PIName, IIName] = await Promise.all([
      this.minioService.uploadBuffer(
        Buffer.from(platformInvoicePdf.data),
        platformInvoice.id,
        BucketType.invoices,
      ),
      this.minioService.uploadBuffer(
        Buffer.from(influencerInvoicePdf.data),
        influencerInvoice.id,
        BucketType.invoices,
      ),
    ]);

    // 8. Update collaboration status and invoice references in DB
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'done',
    );
    await this.collaborationRepository.updateCollaborationInvoices(
      collaborationId,
      PIName,
      IIName,
    );

    await this.notificationService.send(
      company.userId,
      NotificationType.collaboration_done,
    );

    await this.notificationService.send(
      influencerData.userId,
      NotificationType.collaboration_done,
    );
  }

  async createReview(
    collaborationId: number,
    authorId: number,
    reviewedId: number,
    stars: number,
    description: string,
  ): Promise<void> {
    await this.collaborationRepository.createReview(
      collaborationId,
      authorId,
      reviewedId,
      stars,
      description,
    );

    /// Push notification
    await this.notificationService.send(
      reviewedId,
      NotificationType.new_review,
    );
  }

  async getReview(
    collaborationId: number,
    authorId: number,
    reviewedId: number,
  ): Promise<ReviewEntity | null> {
    const r = await this.collaborationRepository.getReview(
      collaborationId,
      authorId,
      reviewedId,
    );
    return r;
  }

  async getReviewsByAuthor(authorId: number): Promise<ReviewEntity[]> {
    const r = await this.collaborationRepository.getReviewsByAuthor(authorId);
    return r;
  }

  async getReviewsByReviewed(reviewedId: number): Promise<ReviewEntity[]> {
    const r =
      await this.collaborationRepository.getReviewsByReviewed(reviewedId);
    return r;
  }

  async getPlatformQuote(collaborationId: number): Promise<internal.Readable> {
    const c = await this.collaborationRepository.findById(collaborationId);
    const file = await this.minioService.getFile(
      BucketType.invoices,
      c.platformQuote,
    );
    return file;
  }

  async getPlatformInvoice(
    collaborationId: number,
  ): Promise<internal.Readable> {
    const c = await this.collaborationRepository.findById(collaborationId);
    const file = await this.minioService.getFile(
      BucketType.invoices,
      c.platformInvoice,
    );
    return file;
  }

  async getInfluencerInvoice(
    collaborationId: number,
  ): Promise<internal.Readable> {
    const c = await this.collaborationRepository.findById(collaborationId);
    const file = await this.minioService.getFile(
      BucketType.invoices,
      c.influencerInvoice,
    );
    return file;
  }

  async getInfluencerQuote(
    collaborationId: number,
  ): Promise<internal.Readable> {
    const c = await this.collaborationRepository.findById(collaborationId);
    const file = await this.minioService.getFile(
      BucketType.invoices,
      c.influencerQuote,
    );
    return file;
  }

  async acceptCollaboration(collaborationId: number): Promise<void> {
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'waiting_for_company_payment',
    );

    const c = await this.collaborationRepository.findById(collaborationId);
    const company = await this.companyRepository.getCompanyById(c.companyId);

    await this.notificationService.send(
      company.userId,
      NotificationType.collaboration_waiting_for_company_payment,
    );
  }

  async refuseCollaboration(collaborationId: number): Promise<void> {
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'refused_by_influencer',
    );

    const c = await this.collaborationRepository.findById(collaborationId);
    const company = await this.companyRepository.getCompanyById(c.companyId);

    await this.notificationService.send(
      company.userId,
      NotificationType.collaboration_refused_by_influencer,
    );
  }

  async endCollaboration(collaborationId: number): Promise<void> {
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'pending_company_validation',
    );

    const c = await this.collaborationRepository.findById(collaborationId);
    const company = await this.companyRepository.getCompanyById(c.companyId);

    await this.notificationService.send(
      company.userId,
      NotificationType.collaboration_pending_company_validation,
    );
  }

  async getInfluencerReviewSummaries(
    userId: number,
  ): Promise<ReviewSummaryEntity[]> {
    const r =
      await this.collaborationRepository.getInfluencerReviewSummaries(userId);
    return r;
  }

  async getCompanyReviewSummaries(
    userId: number,
  ): Promise<ReviewSummaryEntity[]> {
    const r =
      await this.collaborationRepository.getCompanyReviewSummaries(userId);
    return r;
  }
  async getCollaboratedCompanies(
    influencerUserId: number,
  ): Promise<CollaboratedCompanyEntity[]> {
    return this.collaborationRepository.getCollaboratedCompany(
      influencerUserId,
    );
  }

  async getCollaboratedInfluencers(
    companyUserId: number,
  ): Promise<InfluencerSummary[]> {
    return this.collaborationRepository.getCollaboratedInfluencers(
      companyUserId,
    );
  }

  async getRecentCollaborationsByInfluencerId(
    userId: number,
  ): Promise<CollaborationSummaryEntity[]> {
    const r =
      await this.collaborationRepository.getRecentCollaborationsByInfluencerId(
        userId,
      );
    return r;
  }
}
