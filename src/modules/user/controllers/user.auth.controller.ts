import { Controller, Post, Body } from '@nestjs/common';
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

@Controller('user/auth')
export class UserAuthController {
  constructor(private readonly authService: UserAuthService) {}

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
  async verifyRegisterCode(@Body() dto: VerifyRegisterCodeDto): Promise<void> {
    const { email, code } = dto;
    await this.authService.verifyRegisterCode(email, code);
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
}
