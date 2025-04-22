import {
  Controller,
  Put,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  StreamableFile,
  Get,
  Param,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProfilePictureUpdatedDto } from '../dtos/profile-picture-updated.dto';
import { IdFromJWT } from 'src/commons/decorators/id-from-jwt.decorators';
import { AuthGuard } from 'src/commons/guards/auth.guard';
import { InfluencerService } from '../services/inlfuencer.service';
import { PortfolioUpdatedDto } from '../dtos/portfolio-updated.dto';
import { UpdateNameDto } from '../dtos/update-name.dto';
import { UpdateDescriptionDto } from '../dtos/update-description.dto';
import { UpdateDepartmentDto } from '../dtos/update-department.dto';
import { UpdateThemesDto } from '../dtos/update-themes.dto';
import { UpdateTargetAudienceDto } from '../dtos/update-target-audience.dto';

@Controller('influencer')
export class InfluencerController {
  constructor(private readonly influencerService: InfluencerService) {}

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
    @IdFromJWT() userId: string,
  ): Promise<ProfilePictureUpdatedDto> {
    const newProfilePicture: string =
      await this.influencerService.updateProfilePicture(userId, file);
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
    @IdFromJWT() userId: string,
  ): Promise<StreamableFile> {
    const stream = await this.influencerService.getProfilePicture(userId);
    return new StreamableFile(stream);
  }

  /**
   * Updates the entire portfolio of the currently authenticated user.
   *
   * @param files - The uploaded files representing the new portfolio.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves when the portfolio is successfully updated.
   */
  @ApiOperation({ summary: 'Update user portfolio' })
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AuthGuard)
  @Put('update-all-portfolio')
  async updateAllPortfolio(
    @UploadedFiles() files: Express.Multer.File[],
    @IdFromJWT() userId: string,
  ): Promise<PortfolioUpdatedDto> {
    let newPortfolio = await this.influencerService.updateAllPortfolio(
      userId,
      files,
    );
    return new PortfolioUpdatedDto(newPortfolio);
  }

  /**
   * Retrieves a specific portfolio file of the currently authenticated user.
   *
   * @param name - The name of the portfolio file to retrieve.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A stream of the requested portfolio file.
   */
  @ApiOperation({ summary: 'Get specific portfolio file' })
  @UseGuards(AuthGuard)
  @Get('get-portfolio/:name')
  async getPortfolio(
    @IdFromJWT() userId: string,
    @Param('name') name: string,
  ): Promise<StreamableFile> {
    const stream = await this.influencerService.getPortfolio(userId, name);
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
    @IdFromJWT() userId: string,
    @Body() body: UpdateNameDto,
  ): Promise<void> {
    await this.influencerService.updateName(userId, body.name);
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
    @IdFromJWT() userId: string,
    @Body() body: UpdateDescriptionDto,
  ): Promise<void> {
    await this.influencerService.updateDescription(userId, body.description);
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
    @IdFromJWT() userId: string,
    @Body() body: UpdateDepartmentDto,
  ): Promise<void> {
    await this.influencerService.updateDepartment(userId, body.department);
  }

  /**
   * Updates the themes of the currently authenticated user.
   *
   * @param themes - The new themes to update.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves when the themes are successfully updated.
   */
  @ApiOperation({ summary: 'Update user themes' })
  @UseGuards(AuthGuard)
  @Put('update-themes')
  async updateThemes(
    @IdFromJWT() userId: string,
    @Body() body: UpdateThemesDto,
  ): Promise<void> {
    await this.influencerService.updateThemes(userId, body.themes);
  }

  /**
   * Updates the target audience of the currently authenticated user.
   *
   * @param targetAudience - The new target audience to update.
   * @param userId - The ID of the user extracted from the JWT token.
   * @returns A promise that resolves when the target audience is successfully updated.
   */
  @ApiOperation({ summary: 'Update user target audience' })
  @UseGuards(AuthGuard)
  @Put('update-target-audience')
  async updateTargetAudience(
    @Body() body: UpdateTargetAudienceDto,

    @IdFromJWT() userId: string,
  ): Promise<void> {
    await this.influencerService.updateTargetAudience(
      userId,
      body.target_audience,
    );
  }
}
