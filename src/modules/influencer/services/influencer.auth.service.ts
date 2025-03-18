import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtContent } from '../../../commons/types/jwt-content';
import * as argon2 from 'argon2';
import { InfluencerRepository } from '../repositories/influencer.repository';
import { UserNotFoundException } from 'src/commons/errors/user-not-found';
import { InvalidPasswordException } from 'src/commons/errors/invalid-password';
import { AccountType } from 'src/commons/enums/account_type';

@Injectable()
export class InfluencerAuthService {
  constructor(
    private readonly influencerRepository: InfluencerRepository,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * Logged a user.
   * @param email - The user email.
   * @param password - The user password.
   * @returns The generated JWT of the logged user.
   */
  async login(email: string, password: string): Promise<string> {
    // Get the user and throw an error if it doesn't exist
    const user = await this.influencerRepository.getUserByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }
    // Verify password (throw error if not matching)
    const match = await argon2.verify(user.passwordHash, password);
    if (!match) {
      throw new InvalidPasswordException();
    }
    // Generate an accessToken
    return await this.jwtService.signAsync({
      id: user.id,
      account_type: AccountType.influencer,
    } as JwtContent);
  }
}
