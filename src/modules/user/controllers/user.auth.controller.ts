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

@Controller('user/auth')
export class UserAuthController {
  constructor(
    private readonly authService: UserAuthService,
    private readonly jwtService: JwtService,
    private readonly facebookService: FacebookService,
  ) {}

  /**
   * Handle POST requests to log a user.
   * @param LoginDto - Data Transfer Object (DTO) containing the details of the user to log.
   * @returns The JWT of the currently logged-in user.
   */
  @ApiOperation({ description: 'Login with an user account' })
  @ApiResponse({ type: LoggedDto })
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoggedDto> {
    const { email, password } = dto;
    const accessToken = await this.authService.login(email, password);
    return new LoggedDto(accessToken);
  }

  /**
   * Handle POST requests to register a new user.
   * @param RegisterDto - Data Transfer Object (DTO) containing the details of the user to register.
   * @returns void.
   */
  @ApiOperation({})
  @ApiResponse({})
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<void> {
    const { email, password, account_type } = dto;
    await this.authService.register(email, password, account_type);
  }

  @ApiOperation({})
  @ApiResponse({})
  @Post('register/verify')
  async verifyRegisterCode(
    @Body() dto: VerifyRegisterCodeDto,
  ): Promise<LoggedDto> {
    const { email, code } = dto;
    const accessToken = await this.authService.verifyRegisterCode(email, code);
    return new LoggedDto(accessToken);
  }

  @ApiOperation({})
  @ApiResponse({})
  @Post('register/resent-verification-code')
  async resentRegisterVerificationCode(
    @Body() dto: ResentRegisterVerificationCodeDto,
  ): Promise<void> {
    const { email } = dto;
    await this.authService.resentRegisterVerificationCode(email);
  }

  @ApiOperation({})
  @ApiResponse({})
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    const { email } = dto;
    await this.authService.forgotPassword(email);
  }

  @ApiOperation({})
  @ApiResponse({})
  @Post('forgot-password/verify')
  async verifyForgotPassword(
    @Body() dto: VerifyForgotPasswordDto,
  ): Promise<void> {
    const { email, code, password } = dto;
    await this.authService.verifyForgotPassword(email, password, code);
  }

  @ApiOperation({})
  @ApiResponse({})
  @Post('forgot-password/resent-verification-code')
  async resentForgotPasswordVerificationCode(
    @Body() dto: ResentForgotPasswordVerificationCodeDto,
  ): Promise<void> {
    const { email } = dto;
    await this.authService.resentForgotPasswordVerificationCode(email);
  }

  @ApiOperation({})
  @ApiResponse({})
  @Get('login-with-google/:id_token')
  async loginWithGoogle(@Param('id_token') idToken: string): Promise<any> {
    const map = await this.authService.loginWithGoogle(idToken);
    return map;
  }

  @ApiOperation({})
  @ApiResponse({})
  @Get('login-with-apple/:id_token')
  async loginWithApple(@Param('id_token') idToken: string): Promise<any> {
    const map = await this.authService.loginWithApple(idToken);
    return map;
  }

  @ApiOperation({})
  @ApiResponse({})
  @Post('complete-oauth-user')
  async completeOAuthUser(
    @Body() dto: CompleteOAuthGoogleUserDto,
  ): Promise<any> {
    const jwt = await this.authService.completeOAuthUser(
      dto.provider_user_id,
      dto.account_type,
    );
    return { access_token: jwt };
  }

  @ApiOperation({})
  @ApiResponse({})
  @UseGuards(AuthGuard)
  @Get('is-registered-locally')
  async isRegisteredLocally(@IdFromJWT() userId: string): Promise<any> {
    const isRegisteredLocally =
      await this.authService.isRegisteredLocally(userId);
    return { is_registered_locally: isRegisteredLocally };
  }

  @ApiOperation({})
  @ApiResponse({})
  @UseGuards(AuthGuard)
  @Put('update-password')
  async updatePassword(
    @IdFromJWT() userId: string,
    @Body() dto: UpdatePasswordDto,
  ): Promise<void> {
    const { password, new_password } = dto;
    await this.authService.updatePassword(userId, password, new_password);
  }

  @ApiOperation({})
  @ApiResponse({})
  @UseGuards(AuthGuard)
  @Post('update-email')
  async updateEmail(
    @IdFromJWT() userId: string,
    @Body() dto: UpdateEmailDto,
  ): Promise<void> {
    const { new_email, password } = dto;
    await this.authService.updateEmail(userId, password, new_email);
  }

  @ApiOperation({})
  @ApiResponse({})
  @UseGuards(AuthGuard)
  @Post('update-email/verify')
  async verifyUpdateEmail(
    @IdFromJWT() userId: string,
    @Body() dto: VerifyUpdateEmailDto,
  ): Promise<void> {
    const { new_email, code } = dto;
    await this.authService.verifyUpdateEmail(userId, new_email, code);
  }

  @ApiOperation({})
  @ApiResponse({})
  @UseGuards(AuthGuard)
  @Post('update-email/resent-verification-code')
  async resentUpdateEmailVerificationCode(
    @Body() dto: ResentUpdateEmailVerificationCodeDto,
  ): Promise<void> {
    const { new_email } = dto;
    await this.authService.resentUpdateEmailVerificationCode(new_email);
  }

  @ApiOperation({})
  @ApiResponse({})
  @UseGuards(AuthGuard)
  @Delete('delete-user')
  async deleteUser(@IdFromJWT() userId: string): Promise<void> {
    await this.authService.deleteUser(userId);
  }

  @Get('login-with-facebook')
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
        <head>
          <meta charset="UTF-8" />
          <script>
            window.location.href = '${deeplink}';
          </script>
        </head>
      </html>
    `;

    res.status(200).send(html);
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Get('facebook/instagram-accounts')
  async getInstagramAccounts(
    @IdFromJWT() userId: string,
  ): Promise<FetchedInstagramAccountDto[]> {
    const ia = await this.facebookService.getInstagramAccounts(userId);
    return FetchedInstagramAccountDto.fromEntities(ia);
  }
  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Get('facebook/has-session')
  async hasFacebookSession(@IdFromJWT() userId: string): Promise<any> {
    const hasSession = await this.facebookService.hasFacebookSession(userId);
    return { has_session: hasSession };
  }

  @ApiOperation({})
  @UseGuards(AuthGuard)
  @ApiResponse({})
  @Delete('facebook/logout')
  async logoutFacebook(@IdFromJWT() userId: string): Promise<void> {
    await this.authService.deleteOauth(userId, 'facebook');
    await this.facebookService.deleteInstagramAccount(userId);
  }
}
