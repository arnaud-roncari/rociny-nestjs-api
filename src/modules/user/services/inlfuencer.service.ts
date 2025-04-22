import { Injectable } from '@nestjs/common';
import { FileRequiredException } from 'src/commons/errors/file-required';
import { InfluencerRepository } from '../repositories/influencer.repository';
import { UserNotFoundException } from 'src/commons/errors/user-not-found';
import { MinioService } from 'src/modules/minio/minio.service';
import { BucketType } from 'src/commons/enums/bucket_type';
import internal from 'stream';
import { FileNotFoundException } from 'src/commons/errors/file-not-found';

@Injectable()
export class InfluencerService {
  constructor(
    private readonly influencerRepository: InfluencerRepository,
    private readonly minioService: MinioService,
  ) {}

  /**
   * Sets the profile picture for a user.
   *
   * @param userId - The ID of the user whose profile picture is being set.
   * @param file - The uploaded file containing the profile picture.
   * @throws Error if the file is not provided or the user is not found.
   */
  async updateProfilePicture(
    userId: string,
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
    let oldProfilePicture = user.profilePicture;

    // Upload new profile picture
    let newProfilePicture = await this.minioService.uploadFile(
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
  async getProfilePicture(userId: string): Promise<internal.Readable> {
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
    userId: string,
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

  /**
   * Retrieves a specific portfolio file for a user by its name.
   *
   * @param userId - The ID of the user whose portfolio file is being retrieved.
   * @param fileName - The name of the portfolio file to retrieve.
   * @returns The file as a readable stream.
   * @throws Error if the user is not found or the file does not exist.
   */
  async getPortfolio(
    userId: string,
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
  async updateName(userId: string, name: string): Promise<void> {
    const user = await this.influencerRepository.getInfluencer(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.influencerRepository.updateName(userId, name);
  }

  /**
   * Updates the description of the user.
   *
   * @param userId - The ID of the user whose description is being updated.
   * @param description - The new description for the user.
   * @throws Error if the user is not found.
   */
  async updateDescription(userId: string, description: string): Promise<void> {
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
  async updateDepartment(userId: string, department: string): Promise<void> {
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
  async updateThemes(userId: string, themes: string[]): Promise<void> {
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
    userId: string,
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
}
