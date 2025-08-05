import { Injectable, NotFoundException } from '@nestjs/common';
import { CollaborationRepository } from '../repositories/collaboration.repository';
import { CreateCollaborationDto } from '../dtos/create-collaboration.dto';
import { CollaborationEntity } from '../entities/collaboration.entity';
import { CollaborationNotFoundException } from 'src/commons/errors/collaboration-not-found';
import { BucketType } from 'src/commons/enums/bucket_type';
import { MinioService } from 'src/modules/minio/minio.service';
import { FileRequiredException } from 'src/commons/errors/file-required';

@Injectable()
export class CollaborationService {
  constructor(
    private readonly collaborationRepository: CollaborationRepository,
    private readonly minioService: MinioService,
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
}
