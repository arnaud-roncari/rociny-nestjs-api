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
    userId: string,
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

  async hasFacebookSession(userId: string): Promise<boolean> {
    const r = await this.facebookRepository.hasFacebookSession(userId);
    return r;
  }

  async hasInstagramAccount(userId: string): Promise<boolean> {
    const r = await this.facebookRepository.hasInstagramAccount(userId);
    return r;
  }

  async getInstagramAccount(userId: string): Promise<InstagramAccountEntity> {
    const ia = await this.facebookRepository.getInstagramAccount(userId);
    return ia;
  }

  async createInstagramAccount(
    userId: string,
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
  async deleteInstagramAccount(userId: string): Promise<void> {
    await this.facebookRepository.deleteInstagramAccount(userId);
  }
}
