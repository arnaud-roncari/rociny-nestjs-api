import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { LoggedDto } from '../dtos/logged.dto';
import { UserAuthService } from '../services/user.auth.service';

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
}
