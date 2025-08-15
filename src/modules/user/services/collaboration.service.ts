import { Injectable, NotFoundException } from '@nestjs/common';
import { CollaborationRepository } from '../repositories/collaboration.repository';
import { CreateCollaborationDto } from '../dtos/create-collaboration.dto';
import { CollaborationEntity } from '../entities/collaboration.entity';
import { CollaborationNotFoundException } from 'src/commons/errors/collaboration-not-found';
import { BucketType } from 'src/commons/enums/bucket_type';
import { MinioService } from 'src/modules/minio/minio.service';
import { FileRequiredException } from 'src/commons/errors/file-required';
import { CollaborationSummaryEntity } from '../entities/collaboration_summary.entity';
import { CompanyEntity } from '../entities/company.entity';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { InfluencerRepository } from '../repositories/influencer.repository';
import { ReviewEntity } from '../entities/review.entity';
import { CompanyRepository } from '../repositories/company.repository';
import { kCommission } from 'src/commons/constants';
import axios from 'axios';

@Injectable()
export class CollaborationService {
  constructor(
    private readonly collaborationRepository: CollaborationRepository,
    private readonly minioService: MinioService,
    private readonly stripeService: StripeService,
    private readonly influencerRepository: InfluencerRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  /**
   * Creates a new collaboration with the default status 'draft'.
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
    return collab;
  }

  async createCollaboration(
    dto: CreateCollaborationDto,
    companyId: number,
  ): Promise<CollaborationEntity> {
    const status = 'sent_by_company';
    const id = await this.collaborationRepository.createCollaboration(
      dto,
      companyId,
      status,
    );
    const collab = await this.collaborationRepository.findById(id);
    if (!collab) {
      throw new CollaborationNotFoundException();
    }
    return collab;
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

  async cancelCollaboration(collaborationId: number): Promise<void> {
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'canceled_by_company',
    );
  }

  async sendDraftCollaboration(collaborationId: number): Promise<void> {
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'sent_by_company',
    );
    /// Send notification ...
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
  ): Promise<string> {
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
    return paymentIntent.clientSecret;
  }

  async collaborationSupplied(collaborationId: number): Promise<void> {
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'in_progress',
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
  }

  async getReview(
    collaborationId: number,
    authorId: number,
    reviewedId: number,
  ): Promise<ReviewEntity | null> {
    let r = await this.collaborationRepository.getReview(
      collaborationId,
      authorId,
      reviewedId,
    );
    return r;
  }

  async getReviewsByAuthor(authorId: number): Promise<ReviewEntity[]> {
    let r = await this.collaborationRepository.getReviewsByAuthor(authorId);
    return r;
  }

  async getReviewsByReviewed(reviewedId: number): Promise<ReviewEntity[]> {
    let r = await this.collaborationRepository.getReviewsByReviewed(reviewedId);
    return r;
  }
}
