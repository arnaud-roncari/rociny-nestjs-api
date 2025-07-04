import { Injectable } from '@nestjs/common';
import { FacebookRepository } from './facebook.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { UserNotFoundException } from 'src/commons/errors/user-not-found';
import { FetchedInstagramAccountEntity } from './entities/fetched_instagram_account.entity';
import { InstagramAccountEntity } from './entities/instagram_account.entity';
import { InstagramNotFoundException } from 'src/commons/errors/instagram-not-found';
import { InstagramAlreadyExists } from 'src/commons/errors/instagram-already-exist';

@Injectable()
export class FacebookService {
  constructor(
    private readonly facebookRepository: FacebookRepository,
    private readonly userRepository: UserRepository,
  ) {}
  getClientId(): string {
    return process.env.FACEBOOK_CLIENT_ID;
  }

  async getInstagramAccounts(
    userId: number,
  ): Promise<FetchedInstagramAccountEntity[]> {
    const oauthUser = await this.userRepository.getOAuthUserByUserId(
      'facebook',
      userId,
    );

    if (!oauthUser) {
      throw new UserNotFoundException();
    }

    const ia = await this.facebookRepository.getInstagramAccounts(
      oauthUser.accessToken,
    );
    return ia;
  }

  async hasFacebookSession(userId: number): Promise<boolean> {
    const r = await this.facebookRepository.hasFacebookSession(userId);
    return r;
  }

  async hasInstagramAccount(userId: number): Promise<boolean> {
    const r = await this.facebookRepository.hasInstagramAccount(userId);
    return r;
  }

  async getInstagramAccount(userId: number): Promise<InstagramAccountEntity> {
    const ia = await this.facebookRepository.getInstagramAccount(userId);
    return ia;
  }

  async createInstagramAccount(
    userId: number,
    fetchedInstagramAccountId: string,
  ): Promise<void> {
    const hasInstagramAccount =
      await this.facebookRepository.hasInstagramAccount(userId);
    if (hasInstagramAccount) {
      throw new InstagramAlreadyExists();
    }

    const fInstagramAccounts = await this.getInstagramAccounts(userId);

    const fetchedInstagramAccount = fInstagramAccounts.find(
      (f) => f.id === fetchedInstagramAccountId,
    );

    if (!fetchedInstagramAccount) {
      throw new InstagramNotFoundException();
    }

    await this.facebookRepository.createInstagramAccount(
      userId,
      fetchedInstagramAccount.id,
      fetchedInstagramAccount.name,
      fetchedInstagramAccount.username,
      fetchedInstagramAccount.followersCount,
      fetchedInstagramAccount.profilePictureUrl,
    );
  }
  async deleteInstagramAccount(userId: number): Promise<void> {
    await this.facebookRepository.deleteInstagramAccount(userId);
  }

  async refreshInstagramStatistics(userId: number): Promise<void> {
    const oauthUser = await this.userRepository.getOAuthUserByUserId(
      'facebook',
      userId,
    );
    if (!oauthUser) {
      throw new UserNotFoundException();
    }

    const instagram = await this.facebookRepository.getInstagramAccount(userId);
    if (!instagram) {
      throw new InstagramNotFoundException();
    }

    /// Update limited by 1 every 24 hours
    if (
      instagram.updatedAt &&
      Date.now() - new Date(instagram.updatedAt).getTime() < 24 * 60 * 60 * 1000
    ) {
      return;
    }

    const token = oauthUser.accessToken;
    const instagramId = instagram.instagramId;

    const [insights, gender, city, age, media, profile] = await Promise.all([
      this.facebookRepository.getInsights(instagramId, token),
      this.facebookRepository.getGenderInsight(instagramId, token),
      this.facebookRepository.getCityInsight(instagramId, token),
      this.facebookRepository.getAgeInsight(instagramId, token),
      this.facebookRepository.getMediaInsight(instagramId, token),
      this.facebookRepository.getInstagramProfile(instagramId, token),
    ]);

    await this.facebookRepository.updateInstagramAccount({
      userId: userId,
      reach: insights.reach,
      views: insights.views,
      profileViews: insights.profileViews,
      profileViewRate: insights.profileViewRate,
      websiteClicks: insights.websiteClicks,
      linkClicks: insights.profileLinksTaps,
      engagementRate: insights.engagementRate,
      totalInteractions: insights.totalInteractions,
      interactionPercentagePosts: media.interactionPercentagePosts,
      interactionPercentageReels: media.interactionPercentageReels,
      postPercentage: media.postPercentage,
      reelPercentage: media.reelPercentage,
      genderMalePercentage: gender.genderMalePercentage,
      genderFemalePercentage: gender.genderFemalePercentage,
      topCities: city.topCities,
      topAgeRanges: age.topAgeRanges,
      lastMediaUrl: media.lastMediaUrl,
      followersCount: profile.followersCount,
      profilePictureUrl: profile.profilePictureUrl,
    });
  }
}
