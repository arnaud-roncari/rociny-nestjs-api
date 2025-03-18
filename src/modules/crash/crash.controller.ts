import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CrashService } from './crash.service';
import { AuthGuard } from '../../commons/guards/auth.guard';
import { CreateCrashDto } from './dtos/create-crash.dto';

@Controller('crash')
export class CrashController {
  constructor(private readonly crashService: CrashService) {}

  /**
   * Handle POST requests to register a crash.
   * @param LoginDto - Data Transfer Object (DTO) containing the details of the crash to register.
   */
  @ApiOperation({ description: 'Register a crash' })
  @Post('create-crash')
  @UseGuards(AuthGuard)
  async login(@Body() dto: CreateCrashDto): Promise<void> {
    const { exception, stack } = dto;
    await this.crashService.createCrash(exception, stack);
  }
}
