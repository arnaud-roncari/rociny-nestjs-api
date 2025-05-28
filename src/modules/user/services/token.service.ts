import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as dayjs from 'dayjs';
import { InstagramRepository } from '../../collaboration/repositories/instagram.repository';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly instagramRepository: InstagramRepository,
  ) {}

  async exchangeUserToken(shortLivedToken: string): Promise<string> {
    const url = `https://graph.facebook.com/v19.0/oauth/access_token`;

    const params = {
      grant_type: 'fb_exchange_token',
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      fb_exchange_token: shortLivedToken,
    };

    const res = await axios.get(url, { params });
    return res.data.access_token;
  }

  async refreshPageAccessToken(userToken: string, pageId: string): Promise<string> {
    const url = `https://graph.facebook.com/v19.0/${pageId}`;
    const params = {
      fields: 'access_token',
      access_token: userToken,
    };

    const res = await axios.get(url, { params });
    return res.data.access_token;
  }

  async updateReconnectFlags(): Promise<void> {
    const accounts = await this.instagramRepository.findAll();
    const now = dayjs();

    for (const account of accounts) {
      const userTokenDate = account.user_token_last_refresh ? dayjs(account.user_token_last_refresh) : null;
      const pageTokenDate = account.page_token_last_refresh ? dayjs(account.page_token_last_refresh) : null;

      const userTokenAge = userTokenDate ? now.diff(userTokenDate, 'day') : 9999;
      const pageTokenAge = pageTokenDate ? now.diff(pageTokenDate, 'day') : 9999;

      let needsReconnect = false;

      // Si user token > 52 jours, on tente de régénérer le page token
      if (userTokenAge >= 52 && userTokenAge <= 59 && pageTokenAge >= 52) {
        try {
          const newPageToken = await this.refreshPageAccessToken(account.facebook_token, account.facebook_id);
          await this.instagramRepository.updateByInstagramId(account.instagram_id, {
            page_access_token: newPageToken,
            page_token_last_refresh: new Date(),
          });
          this.logger.log(`Page token renouvelé pour @${account.username}`);
        } catch (err) {
          this.logger.error(`❌ Erreur de rafraîchissement pour ${account.username}`, err);
        }
      }

      // Mettre le flag de reconnexion uniquement si les 2 tokens sont vieux
      if (userTokenAge >= 104 && pageTokenAge >= 52) {
        needsReconnect = true;
      }

      if (account.needs_reconnect !== needsReconnect) {
        await this.instagramRepository.updateReconnectStatus(account.instagram_id, needsReconnect);
      }
    }
  }
  
  @Cron(CronExpression.EVERY_WEEK, {
    name: 'weeklyReconnectTokenCheck',
    timeZone: 'Europe/Paris', // Change selon ton fuseau
  })
  async handleWeeklyReconnectTokenCheck() {
    console.log('[CRON] Vérification hebdo des tokens Instagram...');
    await this.updateReconnectFlags();
    console.log('[CRON] Vérification terminée.');
  }
}
