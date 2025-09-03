import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Put,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { LoggedDto } from '../dtos/logged.dto';
import { UserAuthService } from '../services/user.auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { VerifyRegisterCodeDto } from '../dtos/verify-register-code';
import { ResentRegisterVerificationCodeDto } from '../dtos/resent-register-verification-code';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { VerifyForgotPasswordDto } from '../dtos/verify-forgot-password.dto';
import { ResentForgotPasswordVerificationCodeDto } from '../dtos/resent-forgot-password-verification-code';
import { CompleteOAuthGoogleUserDto } from '../dtos/complete-oauth-google-user.dto';
import { AuthGuard } from 'src/commons/guards/auth.guard';
import { IdFromJWT } from 'src/commons/decorators/id-from-jwt.decorators';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { UpdateEmailDto } from '../dtos/update-email.dto';
import { VerifyUpdateEmailDto } from '../dtos/verify-update-email.dto';
import { ResentUpdateEmailVerificationCodeDto } from '../dtos/resent-update-email-verification-code';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { FacebookService } from 'src/modules/facebook/facebook.service';
import { FetchedInstagramAccountDto } from 'src/modules/facebook/dtos/fetched_instagram_account.dto';
import { DeleteDeviceDto } from '../dtos/delete_device_dto';
import { RegisterDeviceDto } from '../dtos/register_device.dto';
import { NotificationService } from 'src/modules/notification/notification.service';

@Controller('auth')
export class UserAuthController {
  constructor(
    private readonly authService: UserAuthService,
    private readonly jwtService: JwtService,
    private readonly facebookService: FacebookService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Logs a user in using email and password.
   */
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ type: LoggedDto })
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoggedDto> {
    const { email, password } = dto;
    const accessToken = await this.authService.login(email, password);
    return new LoggedDto(accessToken);
  }

  /**
   * Registers a new user account.
   */
  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<void> {
    const { email, password, account_type } = dto;
    await this.authService.register(email, password, account_type);
  }

  /**
   * Verifies email registration with a code.
   */
  @ApiOperation({ summary: 'Verify registration with a code' })
  @Post('register/verify')
  async verifyRegisterCode(
    @Body() dto: VerifyRegisterCodeDto,
  ): Promise<LoggedDto> {
    const { email, code } = dto;
    const accessToken = await this.authService.verifyRegisterCode(email, code);
    return new LoggedDto(accessToken);
  }

  /**
   * Resends verification code for registration.
   */
  @ApiOperation({ summary: 'Resend registration verification code' })
  @Post('register/resend-code')
  async resendRegisterVerificationCode(
    @Body() dto: ResentRegisterVerificationCodeDto,
  ): Promise<void> {
    await this.authService.resentRegisterVerificationCode(dto.email);
  }

  /**
   * Initiates password reset by email.
   */
  @ApiOperation({ summary: 'Send forgot password code' })
  @Post('password/forgot')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.authService.forgotPassword(dto.email);
  }

  /**
   * Verifies forgot password code and updates password.
   */
  @ApiOperation({ summary: 'Verify forgot password code and reset password' })
  @Post('password/forgot/verify')
  async verifyForgotPassword(
    @Body() dto: VerifyForgotPasswordDto,
  ): Promise<void> {
    const { email, code, password } = dto;
    await this.authService.verifyForgotPassword(email, password, code);
  }

  /**
   * Resends forgot password code.
   */
  @ApiOperation({ summary: 'Resend forgot password verification code' })
  @Post('password/forgot/resend-code')
  async resendForgotPasswordVerificationCode(
    @Body() dto: ResentForgotPasswordVerificationCodeDto,
  ): Promise<void> {
    await this.authService.resentForgotPasswordVerificationCode(dto.email);
  }

  /**
   * Logs in with Google OAuth.
   */
  @ApiOperation({ summary: 'Login with Google OAuth' })
  @Get('login/google/:id_token')
  async loginWithGoogle(@Param('id_token') idToken: string): Promise<any> {
    return this.authService.loginWithGoogle(idToken);
  }

  /**
   * Logs in with Apple OAuth.
   */
  @ApiOperation({ summary: 'Login with Apple OAuth' })
  @Get('login/apple/:id_token')
  async loginWithApple(@Param('id_token') idToken: string): Promise<any> {
    return this.authService.loginWithApple(idToken);
  }

  /**
   * Completes OAuth user registration (Google/Apple/Facebook).
   */
  @ApiOperation({ summary: 'Complete OAuth user registration' })
  @Post('oauth/complete')
  async completeOAuthUser(
    @Body() dto: CompleteOAuthGoogleUserDto,
  ): Promise<any> {
    const jwt = await this.authService.completeOAuthUser(
      dto.provider_user_id,
      dto.account_type,
    );
    return { access_token: jwt };
  }

  /**
   * Checks if a user is registered locally (email/password).
   */
  @ApiOperation({ summary: 'Check if user is registered locally' })
  @UseGuards(AuthGuard)
  @Get('is-registered-locally')
  async isRegisteredLocally(@IdFromJWT() userId: number): Promise<any> {
    const isRegisteredLocally =
      await this.authService.isRegisteredLocally(userId);
    return { is_registered_locally: isRegisteredLocally };
  }

  /**
   * Updates the password of the logged-in user.
   */
  @ApiOperation({ summary: 'Update password of current user' })
  @UseGuards(AuthGuard)
  @Put('password/update')
  async updatePassword(
    @IdFromJWT() userId: number,
    @Body() dto: UpdatePasswordDto,
  ): Promise<void> {
    await this.authService.updatePassword(
      userId,
      dto.password,
      dto.new_password,
    );
  }

  /**
   * Starts email update flow for logged-in user.
   */
  @ApiOperation({ summary: 'Request email update' })
  @UseGuards(AuthGuard)
  @Post('email/update')
  async updateEmail(
    @IdFromJWT() userId: number,
    @Body() dto: UpdateEmailDto,
  ): Promise<void> {
    await this.authService.updateEmail(userId, dto.password, dto.new_email);
  }

  /**
   * Verifies email update with a code.
   */
  @ApiOperation({ summary: 'Verify email update code' })
  @UseGuards(AuthGuard)
  @Post('email/update/verify')
  async verifyUpdateEmail(
    @IdFromJWT() userId: number,
    @Body() dto: VerifyUpdateEmailDto,
  ): Promise<void> {
    await this.authService.verifyUpdateEmail(userId, dto.new_email, dto.code);
  }

  /**
   * Resends email update verification code.
   */
  @ApiOperation({ summary: 'Resend email update verification code' })
  @UseGuards(AuthGuard)
  @Post('email/update/resend-code')
  async resendUpdateEmailVerificationCode(
    @Body() dto: ResentUpdateEmailVerificationCodeDto,
  ): Promise<void> {
    await this.authService.resentUpdateEmailVerificationCode(dto.new_email);
  }

  /**
   * Deletes the current logged-in user.
   */
  @ApiOperation({ summary: 'Delete current user account' })
  @UseGuards(AuthGuard)
  @Delete('delete')
  async deleteUser(@IdFromJWT() userId: number): Promise<void> {
    await this.authService.deleteUser(userId);
  }

  /**
   * Handles Facebook OAuth deeplink callback.
   */
  @ApiOperation({ summary: 'Login with Facebook (OAuth redirect)' })
  @Get('login/facebook')
  async loginWithFacebook(
    @Query('code') code: string,
    @Query('state') token: string,
    @Res() res: Response,
  ) {
    const payload = this.jwtService.verify(token);
    await this.authService.loginWithFacebook(payload['id'], code);

    const deeplink = `rociny://facebook`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8" /></head>
        <body><script>window.location.href = '${deeplink}'</script></body>
      </html>
    `;
    res.status(200).send(html);
  }

  /**
   * Retrieves connected Instagram accounts from Facebook.
   */
  @ApiOperation({ summary: 'Get Instagram accounts from Facebook session' })
  @UseGuards(AuthGuard)
  @Get('facebook/instagram-accounts')
  async getInstagramAccounts(
    @IdFromJWT() userId: number,
  ): Promise<FetchedInstagramAccountDto[]> {
    const ia = await this.facebookService.getInstagramAccounts(userId);
    return FetchedInstagramAccountDto.fromEntities(ia);
  }

  /**
   * Checks if user has an active Facebook session.
   */
  @ApiOperation({ summary: 'Check if Facebook session exists' })
  @UseGuards(AuthGuard)
  @Get('facebook/session')
  async hasFacebookSession(@IdFromJWT() userId: number): Promise<any> {
    return {
      has_session: await this.facebookService.hasFacebookSession(userId),
    };
  }

  /**
   * Logs out user from Facebook and deletes Instagram accounts.
   */
  @ApiOperation({ summary: 'Logout from Facebook and clear Instagram data' })
  @UseGuards(AuthGuard)
  @Delete('facebook/logout')
  async logoutFacebook(@IdFromJWT() userId: number): Promise<void> {
    await this.authService.deleteOauth(userId, 'facebook');
    await this.facebookService.deleteInstagramAccount(userId);
  }

  /**
   * Registers a device for push notifications.
   */
  @ApiOperation({ summary: 'Register a device for push notifications' })
  @UseGuards(AuthGuard)
  @Post('devices')
  async registerDevice(
    @IdFromJWT() userId: number,
    @Body() dto: RegisterDeviceDto,
  ): Promise<void> {
    await this.notificationService.registerDevice(userId, dto.onesignal_id);
  }

  /**
   * Deletes a registered device by its OneSignal ID.
   */
  @ApiOperation({ summary: 'Delete a registered device' })
  @UseGuards(AuthGuard)
  @Delete('devices')
  async deleteDevice(@Body() dto: DeleteDeviceDto): Promise<void> {
    await this.notificationService.deleteDevice(dto.onesignal_id);
  }
}
