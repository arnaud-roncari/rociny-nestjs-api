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

  async setConnectedVat(accountId: string, vatNumber: string) {
    const list = await StripeService.stripe.taxIds.list(
      { limit: 100 },
      { stripeAccount: accountId },
    );

    for (const tax of list.data) {
      if (tax.type === 'eu_vat') {
        await StripeService.stripe.taxIds.del(tax.id, {
          stripeAccount: accountId,
        });
      }
    }

    const taxId = await StripeService.stripe.taxIds.create(
      { type: 'eu_vat', value: vatNumber },
      { stripeAccount: accountId },
    );

    return taxId.id;
  }

  async hasConnectedVat(accountId: string) {
    const list = await StripeService.stripe.taxIds.list(
      { limit: 100 },
      { stripeAccount: accountId },
    );
    return list.data.some((t) => t.type === 'eu_vat');
  }

  // - - -

  async setCustomerVat(customerId: string, vatNumber: string) {
    const list = await StripeService.stripe.customers.listTaxIds(customerId, {
      limit: 100,
    });

    for (const tax of list.data) {
      if (tax.type === 'eu_vat') {
        await StripeService.stripe.customers.deleteTaxId(customerId, tax.id);
      }
    }

    const taxId = await StripeService.stripe.customers.createTaxId(customerId, {
      type: 'eu_vat',
      value: vatNumber,
    });

    return taxId.id;
  }

  async hasCustomerVat(customerId: string) {
    const list = await StripeService.stripe.customers.listTaxIds(customerId, {
      limit: 100,
    });
    return list.data.some((t) => t.type === 'eu_vat');
  }

  async setCustomerBillingAddress(
    accountId: string,
    city: string,
    street: string,
    postalCode: string,
  ) {
    await StripeService.stripe.customers.update(accountId, {
      address: {
        line1: street,
        city: city,
        postal_code: postalCode,
        country: 'FR',
      },
    });
  }

  async setCustomerTradeName(accountId: string, tradeName: string) {
    await StripeService.stripe.customers.update(accountId, {
      name: tradeName,
    });
  }

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

  async createPaymentIntent(
    collaborationId: number,
    amount: number,
    customerId: string,
  ): Promise<{ paymentIntentId: string; clientSecret: string }> {
    const amountMinor = Math.round(amount * 100);

    const pi = await StripeService.stripe.paymentIntents.create(
      {
        amount: amountMinor,
        currency: 'eur',
        customer: `${customerId}`,
        automatic_payment_methods: { enabled: true },
        transfer_group: `collaboration_${collaborationId}`,
        metadata: {
          collaborationId: collaborationId,
          purpose: 'supply_collaboration',
          appCustomerId: String(customerId),
        },
      },
      {
        idempotencyKey: `supply_collaboration_${collaborationId}_${amountMinor}`,
      },
    );

    return { paymentIntentId: pi.id, clientSecret: pi.client_secret };
  }

  async transferToInfluencer(
    destination: string,
    amount: number,
    collaborationId: number,
  ): Promise<{ transferId: string; amountMinor: number }> {
    const amountMinor = Math.round(amount * 100);

    const transfer = await StripeService.stripe.transfers.create(
      {
        amount: amountMinor,
        currency: 'eur',
        destination: destination,
        transfer_group: `collaboration_${collaborationId}`,
        metadata: {
          collaborationId: String(collaborationId),
          purpose: 'payout_influencer',
        },
      },
      {
        idempotencyKey: `payout_influencer_${destination}_collaboration_${collaborationId}_${amountMinor}`,
      },
    );

    return { transferId: transfer.id, amountMinor };
  }

  async getBalance(currency: string = 'eur'): Promise<any> {
    const bal = await StripeService.stripe.balance.retrieve();
    return bal;
  }
}
