import { Injectable, OnModuleInit } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements OnModuleInit {
  private static stripe: Stripe;

  async onModuleInit() {
    if (!StripeService.stripe) {
      StripeService.stripe = new Stripe(process.env.STRIPE_SECRET, {
        apiVersion: '2025-04-30.basil',
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

  async isAccountCompleted(stripeAccountId: string): Promise<boolean> {
    const account =
      await StripeService.stripe.accounts.retrieve(stripeAccountId);

    return (
      account.details_submitted === true &&
      account.charges_enabled === true &&
      account.payouts_enabled === true
    );
  }

  async createLoginLink(accountId: string): Promise<string> {
    const loginLink =
      await StripeService.stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  }

  // - - -

  async createCustomer(
    email: string,
  ): Promise<Stripe.Response<Stripe.Customer>> {
    const customer = await StripeService.stripe.customers.create({
      email,
    });

    return customer;
  }

  async createSetupIntent(
    customerId: string,
  ): Promise<Stripe.Response<Stripe.SetupIntent>> {
    const setupIntent = await StripeService.stripe.setupIntents.create({
      customer: customerId,
    });

    return setupIntent;
  }

  /**
   * Checks if the Stripe customer has at least one attached payment method of type 'card'.
   *
   * @param customerId - The Stripe customer ID.
   * @returns true if the customer has at least one card payment method, false otherwise.
   */
  async hasCardPaymentMethod(customerId: string): Promise<boolean> {
    const paymentMethods = await StripeService.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data.length > 0;
  }

  async createEphemeralKey(customerId: string): Promise<Stripe.EphemeralKey> {
    return await StripeService.stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2025-04-30.basil' },
    );
  }

  /**
   * Creates a Stripe Customer Billing Portal session URL
   * to allow the customer to manage their payment methods and billing.
   *
   * @param customerId - The Stripe customer ID
   * @returns The URL string for the Stripe Billing Portal session
   */
  async createBillingPortalSession(customerId: string): Promise<string> {
    const session = await StripeService.stripe.billingPortal.sessions.create({
      customer: customerId,
    });

    return session.url;
  }
}
