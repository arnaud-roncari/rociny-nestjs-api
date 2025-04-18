import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtContent } from '../../../commons/types/jwt-content';
import * as argon2 from 'argon2';
import { UserNotFoundException } from 'src/commons/errors/user-not-found';
import { InvalidPasswordException } from 'src/commons/errors/invalid-password';
import { UserRepository } from '../repositories/user.repository';
import { AccountType } from 'src/commons/enums/account_type';
import { UserRegisteringEntity } from '../entities/user_registering.entity';
import { UserAlreadyRegistering } from 'src/commons/errors/user-already-registering';
import { UserAlreadyExists } from 'src/commons/errors/user-already-exist';
import { InvalidCodeException } from 'src/commons/errors/invalid-code';
import { UserForgettingPasswordEntity } from '../entities/user_forgetting_password.entity';
import { UserAlreadyResetingPassword } from 'src/commons/errors/user-already-reseting-password';
import { MailService } from '../../mail/services/mail.service';
import { MailTemplate } from '../../mail/enums/mail-template.enum';

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

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

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
    let verificationCode = Math.floor(10000 + Math.random() * 90000); // Generates a 5-digit code
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
    await this.mailService.sendMail({
      to: email,
      subject: 'Votre code de vérification Rociny',
      template: MailTemplate.VERIFICATION_CODE,
      context: {
        code: verificationCode,
      },
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
  ): Promise<void> {
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
    await this.userRepository.createUser(
      user.email,
      user.passwordHash,
      user.accountType,
    );

    // Remove the user from the usersRegistering array
    this.usersRegistering.splice(this.usersRegistering.indexOf(user), 1);
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
    await this.mailService.sendMail({
      to: email,
      subject: 'Votre code de vérification Rociny',
      template: MailTemplate.VERIFICATION_CODE,
      context: {
        code: user.verificationCode,
      },
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
    let verificationCode = Math.floor(10000 + Math.random() * 90000); // Generates a 5-digit code
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
    await this.mailService.sendMail({
      to: email,
      subject: 'Votre code de réinitialisation de mot de passe - Rociny',
      template: MailTemplate.RESET_PASSWORD,
      context: {
        code: verificationCode,
      },
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

    await this.mailService.sendMail({
      to: email,
      subject: 'Votre code de réinitialisation de mot de passe - Rociny',
      template: MailTemplate.RESET_PASSWORD,
      context: {
        code: user.verificationCode,
      },
    });
  }
}
