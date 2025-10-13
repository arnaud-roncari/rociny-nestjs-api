import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtContent } from '../../../commons/types/jwt-content';
import * as argon2 from 'argon2';
import { UserNotFoundException } from 'src/commons/errors/user-not-found';
import { InvalidPasswordException } from 'src/commons/errors/invalid-password';
import { UserRepository } from '../repositories/user.repository';
import { AccountType } from 'src/commons/enums/account_type';
import { UserRegisteringEntity } from '../entities/user_registering.entity';
import { InvalidGoogleTokenException } from 'src/commons/errors/invalid-google-token';
import { UserAlreadyExists } from 'src/commons/errors/user-already-exist';
import { InvalidCodeException } from 'src/commons/errors/invalid-code';
import { UserForgettingPasswordEntity } from '../entities/user_forgetting_password.entity';
import { UserAlreadyResetingPassword } from 'src/commons/errors/user-already-reseting-password';
import { EmailService } from '../../email/email.service';
import { EmailTemplate } from '../../email/enums/email-template.enum';
import { InfluencerRepository } from '../repositories/influencer.repository';
import { CompanyRepository } from '../repositories/company.repository';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { UserEntity } from '../entities/user.entity';
import { UserAlreadyRegistering } from 'src/commons/errors/user-already-registering';
import { UserAlreadyCompleted } from 'src/commons/errors/user-already-completed';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { InvalidAppleTokenException } from 'src/commons/errors/invalid-apple-token';
import { UserUpdatingEmailEntity } from '../entities/user_updating_email.entity';
import { UserAlreadyUpdatingEmail } from 'src/commons/errors/user-already-updating-email';
import { EmailAlreadyUsed } from 'src/commons/errors/email-already-used';
import { FacebookRepository } from 'src/modules/facebook/facebook.repository';
import { NotificationRepository } from 'src/modules/notification/notification.repository';

@Injectable()
export class UserAuthService {
  /**
   * A list of users who are pending registration confirmation.
   * This array temporarily holds instances of `UserRegisteringEntity`
   * representing users who have initiated the registration process
   * but have not yet completed it.
   */
  private readonly usersRegistering: Array<UserRegisteringEntity> = [];

  /**
   * A list of users who are in the process of resetting their passwords.
   * This array stores instances of `UserForgettingPasswordEntity` to track
   * users who have initiated the password recovery process.
   */
  private readonly usersForgettingPassword: Array<UserForgettingPasswordEntity> =
    [];

  /**
   * A temporary in-memory list of users who are currently in the process
   * of updating their email address. This is used to track the state of users
   * who have initiated an email change but have not yet completed verification.
   */
  private readonly usersUpdatingEmail: Array<UserUpdatingEmailEntity> = [];

  /**
   * An instance of the OAuth2Client, used for verifying Google ID tokens.
   * This client allows interaction with Google's OAuth 2.0 system, specifically
   * to verify the authenticity of Google ID tokens during the login process.
   *
   * It is used to ensure that the provided ID token comes from a valid source (Google)
   * and belongs to the expected client (using the provided `GOOGLE_CLIENT_ID`).
   *
   * This client is typically used in the context of login operations where
   * users authenticate via Google OAuth, allowing the application to securely
   * verify user identity before granting access.
   */
  private client: OAuth2Client;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly influencerRepository: InfluencerRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly stripeService: StripeService,
    private readonly facebookRepository: FacebookRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async onModuleInit() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Logged a user.
   * @param email - The user email.
   * @param password - The user password.
   * @returns The generated JWT of the logged user.
   */
  async login(email: string, password: string): Promise<string> {
    // Get the user and throw an error if it doesn't exist
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }

    // If user created from OAuth
    if (!user.passwordHash) {
      throw new InvalidPasswordException();
    }

    // Verify password (throw error if not matching)
    const match = await argon2.verify(user.passwordHash, password);
    if (!match) {
      throw new InvalidPasswordException();
    }
    // Generate an accessToken
    return await this.jwtService.signAsync({
      id: user.id,
      account_type: user.accountType,
    } as JwtContent);
  }

  /**
   * Registers a new user by validating the email, checking for duplicates, and generating a verification code.
   *
   * @param email - The email address of the user to register.
   * @param password - The plain text password of the user to register.
   * @param accountType - The type of account being registered (e.g., admin, user).
   * @returns A promise that resolves when the registration process is initiated.
   *
   * @throws UserAlreadyRegistering - If the email is already in the process of registration.
   * @throws UserAlreadyExists - If the email is already associated with an existing user in the database.
   *
   * @remarks
   * - The method temporarily stores the user in a `usersRegistering` array with a hashed password and a generated verification code.
   * - The user is automatically removed from the `usersRegistering` array after 15 minutes if the registration is not completed.
   * - A verification code is generated and logged to the console (to be replaced with email sending functionality).
   *
   * @todo Implement email sending functionality to send the verification code to the user.
   */
  async register(
    email: string,
    password: string,
    accountType: AccountType,
  ): Promise<void> {
    // Check if the email is already in the usersRegistering array.
    const isEmailInRegistering = this.usersRegistering.some(
      (user) => user.email === email,
    );

    if (isEmailInRegistering) {
      throw new UserAlreadyRegistering();
    }

    // Check if the email is already in the database.
    const isEmailTaken = await this.userRepository.getUserByEmail(email);
    if (isEmailTaken) {
      throw new UserAlreadyExists();
    }

    // Add the user to the array of users pending validation (hashed password, generated code).
    const verificationCode = Math.floor(10000 + Math.random() * 90000); // Generates a 5-digit code
    this.usersRegistering.push(
      new UserRegisteringEntity({
        email,
        passwordHash: await argon2.hash(password),
        accountType,
        verificationCode: verificationCode,
      }),
    );

    // Set a timer to remove the user from the usersRegistering array after 5 minutes
    setTimeout(
      () => {
        const index = this.usersRegistering.findIndex(
          (user) => user.email === email,
        );
        if (index !== -1) {
          this.usersRegistering.splice(index, 1);
        }
      },
      5 * 60 * 1000,
    );

    // Send an email with the verification code
    await this.emailService.sendEmail(email, EmailTemplate.VERIFICATION_CODE, {
      code: verificationCode,
    });
  }

  /**
   * Verifies the registration code for a user and completes the registration process.
   *
   * @param email - The email address of the user attempting to register.
   * @param verificationCode - The verification code provided by the user.
   * @returns A promise that resolves when the registration process is successfully completed.
   * @throws {UserNotFoundException} If no user with the given email is found in the registration list.
   * @throws {InvalidCodeException} If the provided verification code does not match the expected code.
   *
   */
  async verifyRegisterCode(
    email: string,
    verificationCode: number,
  ): Promise<string> {
    // Find the user in the usersRegistering array
    const user = this.usersRegistering.find((user) => user.email === email);

    if (!user) {
      throw new UserNotFoundException();
    }

    // Check if the verification code matches
    if (user.verificationCode !== verificationCode) {
      throw new InvalidCodeException();
    }

    // Save the user to the database
    const createdUser = await this.userRepository.createUser(
      user.email,
      user.passwordHash,
      user.accountType,
    );

    await this.notificationRepository.initializePreferences(createdUser.id);

    // Create related table
    await this.createRelatedTablesForUser(
      createdUser.accountType,
      createdUser.email,
      createdUser.id,
    );

    // Remove the user from the usersRegistering array
    this.usersRegistering.splice(this.usersRegistering.indexOf(user), 1);

    // Generate JWT
    return await this.jwtService.signAsync({
      id: createdUser.id,
      account_type: user.accountType,
    } as JwtContent);
  }

  /**
   * Creates the necessary related tables and Stripe accounts for the user based on their account type.
   *
   * This function handles the creation of a Stripe account or customer depending on whether the user
   * is an influencer or a company. It also saves the relevant data (Stripe account ID or customer ID)
   * in the appropriate database table (influencer or company).
   *
   * @param accountType The account type of the user (either `AccountType.influencer` or `AccountType.company`).
   * @param email The email address of the user, used for creating the Stripe account or customer.
   * @param userId The unique ID of the user, used to associate the Stripe account or customer with the user in the database.
   *
   * @returns A promise that resolves when the account creation and database updates are complete.
   */
  async createRelatedTablesForUser(
    accountType: AccountType,
    email: string,
    userId: number,
  ): Promise<void> {
    if (accountType == AccountType.influencer) {
      // Create a Stripe Express account (type "connect") for the influencer
      const stripeAccount = await this.stripeService.createAccount(email);

      // Save the influencer in the database with their Stripe account ID
      await this.influencerRepository.createInfluencer(
        userId,
        stripeAccount.id,
      );
    } else {
      // Create a Stripe customer account for the company (to handle payments and cards)
      const stripeCustomer = await this.stripeService.createCustomer(email);

      // Save the company with the Stripe customer ID for future payments
      await this.companyRepository.createCompany(userId, stripeCustomer.id);
    }
  }

  /**
   * Resends the registration verification code to the user.
   *
   * @param email - The email address of the user requesting the verification code.
   * @returns A promise that resolves when the verification code is successfully resent.
   * @throws {UserNotFoundException} If no user with the given email is found in the registration list.
   *
   * @todo Implement email sending functionality to send the verification code to the user.
   */
  async resentRegisterVerificationCode(email: string): Promise<void> {
    // Find the user in the usersRegistering array
    const user = this.usersRegistering.find((user) => user.email === email);

    if (!user) {
      throw new UserNotFoundException();
    }

    /// TODO : Implement email sending with the verification code.
    await this.emailService.sendEmail(email, EmailTemplate.VERIFICATION_CODE, {
      code: user.verificationCode,
    });
  }

  /**
   * Handles the forgot password process for a user.
   *
   * @param email - The email address of the user requesting a password reset.
   * @throws UserAlreadyResetingPassword - If the user has already requested a password reset and is in the process of validation.
   * @throws UserNotFoundException - If the provided email does not exist in the database.
   *
   */
  async forgotPassword(email: string): Promise<void> {
    // Check if the email is already in the usersForgettingPassword array.
    const isEmailInForgetting = this.usersForgettingPassword.some(
      (user) => user.email === email,
    );

    if (isEmailInForgetting) {
      throw new UserAlreadyResetingPassword();
    }

    // Check if the email is already in the database.
    const isEmail = await this.userRepository.getUserByEmail(email);
    if (!isEmail) {
      throw new UserNotFoundException();
    }

    // Add the user to the array of users pending validation.
    const verificationCode = Math.floor(10000 + Math.random() * 90000); // Generates a 5-digit code
    this.usersForgettingPassword.push(
      new UserForgettingPasswordEntity({
        email,
        verificationCode: verificationCode,
      }),
    );

    // Set a timer to remove the user from the usersRegistering array after 5 minutes
    setTimeout(
      () => {
        const index = this.usersForgettingPassword.findIndex(
          (user) => user.email === email,
        );
        if (index !== -1) {
          this.usersForgettingPassword.splice(index, 1);
        }
      },
      5 * 60 * 1000,
    );

    // Send an email with the verification code
    await this.emailService.sendEmail(email, EmailTemplate.RESET_PASSWORD, {
      code: verificationCode,
    });
  }

  /**
   * Verifies the forgot password process for a user by checking the provided
   * email, password, and verification code. If the verification is successful,
   * updates the user's password and removes the user from the temporary
   * forgetting password list.
   *
   * @param email - The email address of the user attempting to reset their password.
   * @param password - The new password provided by the user.
   * @param verificationCode - The verification code sent to the user for password reset.
   * @returns A promise that resolves when the password reset process is complete.
   * @throws UserNotFoundException - If no user is found with the provided email.
   * @throws InvalidCodeException - If the provided verification code does not match.
   */
  async verifyForgotPassword(
    email: string,
    password: string,
    verificationCode: number,
  ): Promise<void> {
    // Find the user in the array
    const user = this.usersForgettingPassword.find(
      (user) => user.email === email,
    );

    if (!user) {
      throw new UserNotFoundException();
    }

    // Check if the verification code matches
    if (user.verificationCode !== verificationCode) {
      throw new InvalidCodeException();
    }

    /// Hash and update user password
    const hashedPassword = await argon2.hash(password);
    await this.userRepository.updatePasswordByEmail(email, hashedPassword);

    // Remove the user from the array
    this.usersForgettingPassword.splice(
      this.usersForgettingPassword.indexOf(user),
      1,
    );
  }

  /**
   * Resends the forgot password verification code to the user's email.
   *
   * @param email - The email address of the user requesting the verification code.
   * @returns A promise that resolves when the operation is complete.
   * @throws UserNotFoundException - If no user is found with the provided email.
   */
  async resentForgotPasswordVerificationCode(email: string): Promise<void> {
    // Find the user in the array
    const user = this.usersForgettingPassword.find(
      (user) => user.email === email,
    );

    if (!user) {
      throw new UserNotFoundException();
    }

    await this.emailService.sendEmail(email, EmailTemplate.RESET_PASSWORD, {
      code: user.verificationCode,
    });
  }

  /**
   * Log in or register a user via Google OAuth.
   * - If the user doesn't exist, a new one is created.
   * - If the user exists without accountType, the frontend should complete it later.
   * - If everything is valid, a JWT is returned.
   *
   * @param idToken - Google OAuth ID token.
   * @returns A status and either a JWT or a provider user ID to complete registration.
   * @throws InvalidGoogleTokenException - If the ID token is invalid or expired.
   */
  async loginWithGoogle(idToken: string): Promise<any> {
    // 1. Verify the Google token
    let payload: TokenPayload;
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new InvalidGoogleTokenException();
    }

    const providerUserId = payload.sub;
    const email = payload.email;

    // 2. Try to find existing OAuth user
    const oauthUser = await this.userRepository.getOAuthUser(
      'google',
      providerUserId,
    );

    let user: UserEntity | null = null;

    if (oauthUser) {
      // If linked OAuth user exists, fetch associated user
      user = await this.userRepository.getUserById(oauthUser.userId);

      // User not completed
      if (user.accountType === null) {
        return {
          status: 'new',
          provider_user_id: providerUserId,
        };
      }
    } else {
      // No OAuth user found, try to find user by email
      user = await this.userRepository.getUserByEmail(email);

      const isNew = !user;

      // Create user if not found
      if (isNew) {
        user = await this.userRepository.createUser(email, null, null);

        await this.notificationRepository.initializePreferences(user.id);
      }
      // Link OAuth account
      await this.userRepository.createOAuthUser(
        user.id,
        'google',
        providerUserId,
        null,
        null,
      );

      const isNotCompleted = !user.accountType;

      // If it's a new user or missing account type, ask frontend to complete
      if (isNew || isNotCompleted) {
        return {
          status: 'new',
          provider_user_id: providerUserId,
        };
      }
    }

    // 3. Generate token for completed user
    const jwt = await this.jwtService.signAsync({
      id: user.id,
      account_type: user.accountType,
    } as JwtContent);

    return {
      status: 'logged',
      access_token: jwt,
    };
  }

  async loginWithApple(idToken: string): Promise<any> {
    let payload: any;

    // 1. Verify Apple token
    try {
      const JWKS = createRemoteJWKSet(
        new URL('https://appleid.apple.com/auth/keys'),
      );
      const { payload: verifiedPayload } = await jwtVerify(idToken, JWKS, {
        audience: process.env.APPLE_CLIENT_ID,
        issuer: 'https://appleid.apple.com',
      });
      payload = verifiedPayload;
    } catch (_) {
      void _;
      throw new InvalidAppleTokenException();
    }

    const providerUserId = payload.sub;
    const email = payload.email;

    // 2. Try to find existing OAuth user
    const oauthUser = await this.userRepository.getOAuthUser(
      'apple',
      providerUserId,
    );

    let user: UserEntity | null = null;

    if (oauthUser) {
      user = await this.userRepository.getUserById(oauthUser.userId);

      if (user.accountType === null) {
        return {
          status: 'new',
          provider_user_id: providerUserId,
        };
      }
    } else {
      user = email ? await this.userRepository.getUserByEmail(email) : null;

      const isNew = !user;

      if (isNew) {
        user = await this.userRepository.createUser(email ?? null, null, null);

        await this.notificationRepository.initializePreferences(user.id);
      }

      await this.userRepository.createOAuthUser(
        user.id,
        'apple',
        providerUserId,
        null,
        null,
      );

      const isNotCompleted = !user.accountType;

      if (isNew || isNotCompleted) {
        return {
          status: 'new',
          provider_user_id: providerUserId,
        };
      }
    }

    // 3. Generate JWT for frontend
    const jwt = await this.jwtService.signAsync({
      id: user.id,
      account_type: user.accountType,
    } as JwtContent);

    return {
      status: 'logged',
      access_token: jwt,
    };
  }

  /**
   * Completes the setup of a user who registered via OAuth but has not yet chosen an account type.
   *
   * @param providerUserId - The unique ID from the OAuth provider (e.g., Google).
   * @param accountType - The account type to assign (influencer or company).
   * @returns A signed JWT token for the now-completed user.
   * @throws UserNotFoundException - If no OAuth user is found with the given providerUserId.
   * @throws UserAlreadyCompleted - If the user already has an accountType set.
   */
  async completeOAuthUser(
    providerUserId: string,
    accountType: AccountType,
  ): Promise<any> {
    // Find the OAuth user by provider ID
    const oauthUser =
      await this.userRepository.getOAuthUserByProviderId(providerUserId);

    if (!oauthUser) {
      throw new UserNotFoundException();
    }

    // Get the associated user
    const user = await this.userRepository.getUserById(oauthUser.userId);

    // Prevent double completion
    if (user.accountType !== null) {
      throw new UserAlreadyCompleted();
    }

    // Create related tables (Stripe account/customer)
    await this.createRelatedTablesForUser(accountType, user.email, user.id);

    // Update the user’s account type
    await this.userRepository.updateUserAccountType(user.id, accountType);

    // Generate and return a JWT
    return await this.jwtService.signAsync({
      id: user.id,
      account_type: accountType,
    } as JwtContent);
  }

  /**
   * Checks whether a user is registered locally (i.e., has a local password).
   *
   * @param userId - The unique identifier of the user to check.
   * @returns A promise that resolves to `true` if the user is locally registered, otherwise `false`.
   *
   * @throws {UserNotFoundException} - Thrown if no user is found with the given `userId`.
   *
   * A user is considered "locally registered" if their `passwordHash` field is not null or not an empty string.
   */
  async isRegisteredLocally(userId: number): Promise<boolean> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    if (user.passwordHash !== null && user.passwordHash !== '') {
      return true;
    }
    return false;
  }

  /**
   * Updates a user's password after verifying their current one.
   *
   * @param userId - The ID of the user whose password is being updated.
   * @param password - The user's current password (plaintext).
   * @param newPassword - The new password to set (plaintext).
   *
   * @throws UserNotFoundException - If no user is found with the given ID.
   * @throws InvalidPasswordException - If the user was created via OAuth (no password set)
   *                                    or if the current password is incorrect.
   *
   * This method:
   * - Verifies the user exists.
   * - Rejects users without a password (e.g., registered via Google/Apple).
   * - Compares the current password with the stored hash using Argon2.
   * - Hashes the new password and persists it.
   */
  async updatePassword(
    userId: number,
    password: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // If user created from OAuth
    if (!user.passwordHash) {
      throw new InvalidPasswordException();
    }

    // Verify password (throw error if not matching)
    const match = await argon2.verify(user.passwordHash, password);
    if (!match) {
      throw new InvalidPasswordException();
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.userRepository.updateUserPassword(userId, passwordHash);
  }
  /**
   * Initiates the process to update a user's email address.
   * Verifies the current password, checks if the email is available,
   * generates a verification code, stores the pending update, and sends a verification email.
   *
   * @param userId - The ID of the user requesting the email change.
   * @param password - The user's current password.
   * @param newEmail - The new email address the user wants to set.
   *
   * @throws UserNotFoundException - If the user does not exist.
   * @throws InvalidPasswordException - If the password is incorrect or user registered via OAuth.
   * @throws UserAlreadyUpdatingEmail - If this email is already being used in a pending update.
   * @throws EmailAlreadyUsed - If the email is already taken by another user.
   */
  async updateEmail(
    userId: number,
    password: string,
    newEmail: string,
  ): Promise<void> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new UserNotFoundException();

    if (!user.passwordHash) throw new InvalidPasswordException();

    const match = await argon2.verify(user.passwordHash, password);
    if (!match) throw new InvalidPasswordException();

    const isEmailInUpdating = this.usersUpdatingEmail.some(
      (user) => user.email === newEmail,
    );
    if (isEmailInUpdating) throw new UserAlreadyUpdatingEmail();

    const isEmail = await this.userRepository.getUserByEmail(newEmail);
    if (isEmail) throw new EmailAlreadyUsed();

    const verificationCode = Math.floor(10000 + Math.random() * 90000);

    this.usersUpdatingEmail.push(
      new UserUpdatingEmailEntity({
        email: newEmail,
        verificationCode,
      }),
    );

    setTimeout(
      () => {
        const index = this.usersUpdatingEmail.findIndex(
          (user) => user.email === newEmail,
        );
        if (index !== -1) {
          this.usersUpdatingEmail.splice(index, 1);
        }
      },
      5 * 60 * 1000,
    );

    await this.emailService.sendEmail(newEmail, EmailTemplate.UPDATE_EMAIL, {
      code: verificationCode,
    });
  }

  /**
   * Confirms the email change by validating the verification code.
   * If valid, the user's email is updated and the pending request is removed.
   *
   * @param userId - The ID of the user.
   * @param newEmail - The new email address to confirm.
   * @param verificationCode - The code sent to the new email.
   *
   * @throws UserNotFoundException - If no pending email update is found.
   * @throws InvalidCodeException - If the provided code doesn't match.
   */
  async verifyUpdateEmail(
    userId: number,
    newEmail: string,
    verificationCode: number,
  ): Promise<void> {
    const user = this.usersUpdatingEmail.find(
      (user) => user.email === newEmail,
    );

    if (!user) throw new UserNotFoundException();
    if (user.verificationCode !== verificationCode)
      throw new InvalidCodeException();

    await this.userRepository.updateUserEmail(userId, newEmail);

    this.usersUpdatingEmail.splice(this.usersUpdatingEmail.indexOf(user), 1);
  }

  /**
   * Resends the verification code to confirm an email change.
   *
   * @param newEmail - The new email to which the verification code should be resent.
   *
   * @throws UserNotFoundException - If no pending email update is found for this email.
   */
  async resentUpdateEmailVerificationCode(newEmail: string): Promise<void> {
    const user = this.usersUpdatingEmail.find(
      (user) => user.email === newEmail,
    );

    if (!user) throw new UserNotFoundException();

    await this.emailService.sendEmail(newEmail, EmailTemplate.UPDATE_EMAIL, {
      code: user.verificationCode,
    });
  }

  async deleteUser(userId: number): Promise<void> {
    await this.userRepository.deleteUserById(userId);
  }

  async deleteOauth(userId: number, provider: string): Promise<void> {
    const oauth = await this.userRepository.getOAuthUserByUserId(
      provider,
      userId,
    );
    await this.userRepository.deleteOAuthUserById(oauth.id);
  }

  async loginWithFacebook(userId: number, code: string): Promise<void> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // Convert the code to a long-lived token
    const shortToken =
      await this.facebookRepository.exchangeCodeForShortLivedToken(code);

    const longToken =
      await this.facebookRepository.exchangeShortForLongLivedToken(shortToken);

    // Get the user ID from the long-lived token
    const providerUserId =
      await this.facebookRepository.getFacebookId(longToken);

    // Set expiration date for the token
    // Facebook long-lived tokens are valid for 60 days, so we set it to 59 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 59);

    // Check if the user already has an OAuth user linked to their account
    const oauthUser = await this.userRepository.getOAuthUserByUserId(
      'facebook',
      userId,
    );

    // If the user already has an OAuth user, update the token
    if (oauthUser) {
      await this.userRepository.updateOAuthToken(
        user.id,
        'facebook',
        longToken,
        expiresAt,
      );
      // If the user does not have an OAuth user, create a new one
    } else {
      await this.userRepository.createOAuthUser(
        user.id,
        'facebook',
        providerUserId,
        longToken,
        expiresAt,
      );
    }
  }

  /**
   * Retrieves a user's email by their ID.
   *
   * @param userId - The unique identifier of the user.
   * @returns The user's email address.
   * @throws UserNotFoundException - If no user exists with the provided ID.
   */
  async getEmail(userId: number): Promise<string> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    return user.email;
  }
}
