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

@Injectable()
export class CollaborationService {
  constructor(
    private readonly collaborationRepository: CollaborationRepository,
    private readonly minioService: MinioService,
    private readonly stripeService: StripeService,
    private readonly influencerRepository: InfluencerRepository,
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

  async supplyCollaboration(
    company: CompanyEntity,
    collaborationId: number,
  ): Promise<string> {
    let collaboration =
      await this.collaborationRepository.findById(collaborationId);
    let amount = collaboration.getPriceWithCommission();
    let customerId = company.stripeCustomerId;
    let pi = await this.stripeService.createPaymentIntent(
      collaborationId,
      amount,
      customerId,
    );

    return pi.clientSecret;
  }

  async collaborationSupplied(collaborationId: number): Promise<void> {
    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'in_progress',
    );
  }

  async validateCollaboration(collaborationId: number): Promise<void> {
    let collaboration =
      await this.collaborationRepository.findById(collaborationId);
    let influencer = await this.influencerRepository.getInfluencerById(
      collaboration.influencerId,
    );
    let amount = collaboration.getPrice();
    let destination = influencer.stripeAccountId;
    await this.stripeService.transferToInfluencer(
      destination,
      amount,
      collaborationId,
    );

    await this.collaborationRepository.updateCollaborationStatus(
      collaborationId,
      'done',
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
