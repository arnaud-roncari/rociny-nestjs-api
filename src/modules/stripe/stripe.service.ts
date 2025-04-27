import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private static stripe: Stripe;

  async onModuleInit() {
    if (!StripeService.stripe) {
      StripeService.stripe = new Stripe(process.env.STRIPE_SECRET, {
        apiVersion: '2025-03-31.basil',
      });
    }
  }

  async createAccount(email: string): Promise<Stripe.Response<Stripe.Account>> {
    const account = await StripeService.stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: email,
      capabilities: {
        transfers: { requested: true },
      },
    });
    return account;
  }

  async createAccountLink(accountId: string): Promise<string> {
    const accountLink = await StripeService.stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'https://rociny.com/onboarding/refresh',
      return_url: 'https://rociny.com/onboarding/complete',
      type: 'account_onboarding',
    });
    return accountLink.url;
  }
}
