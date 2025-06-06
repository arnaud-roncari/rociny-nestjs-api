import { Controller, Get, UseGuards } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { AuthGuard } from 'src/commons/guards/auth.guard';

@Controller('facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @UseGuards(AuthGuard)
  @Get('client-id')
  async getClientId(): Promise<any> {
    const clientId: string = this.facebookService.getClientId();
    return { client_id: clientId };
  }
}
