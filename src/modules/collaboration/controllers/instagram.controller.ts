import { Controller, Get, Query } from '@nestjs/common';
import { InstagramService } from '../services/instagramInsight.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Instagram')
@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get('sync')
  @ApiOperation({ summary: 'Synchronise les données Instagram depuis l\'API Graph' })
  @ApiQuery({ name: 'instagramId', type: String, required: true })
  //@ApiQuery({ name: 'pageAccessToken', type: String, required: true })
  //@ApiQuery({ name: 'userId', type: String, required: true })
  async syncInstagramData(
    @Query('instagramId') instagramId: string,
    //@Query('pageAccessToken') pageAccessToken: string,
    //@Query('userId') userId: string
  ): Promise<{ message: string }> {
    await this.instagramService.syncInstagramData(instagramId);//, pageAccessToken, userId);
    return { message: 'Synchronisation terminée avec succès.' };
  }
}
