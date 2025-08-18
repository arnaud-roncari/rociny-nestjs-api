import { Injectable, OnModuleInit } from '@nestjs/common';
import Stripe from 'stripe';
import { ProductPlacementEntity } from '../user/entities/product_placement.entity';
import { CompanyEntity } from '../user/entities/company.entity';
import { InfluencerEntity } from '../user/entities/influencer.entity';

@Injectable()
export class StripeService implements OnModuleInit {
  private static stripe: Stripe;
  private static taxRateId: string;
  private static platformVATNumber: string = 'FR1111111111';

  /**
   * Initializes the Stripe client and ensures the platform tax rate exists.
   */
  async onModuleInit() {
    // Initialize Stripe client once
    if (!StripeService.stripe) {
      StripeService.stripe = new Stripe(process.env.STRIPE_SECRET, {
        apiVersion: '2025-04-30.basil',
      });
    }

    // Check if platform already has a tax rate set, otherwise create one
    const rates = await StripeService.stripe.taxRates.list({ active: true });

    if (rates.data.length > 0) {
      StripeService.taxRateId = rates.data[0].id;
    } else {
      const created = await StripeService.stripe.taxRates.create({
        display_name: 'TVA',
        percentage: 20,
        inclusive: false,
        country: 'FR',
        description: 'TVA 20% Rociny',
      });
      StripeService.taxRateId = created.id;
    }
  }

  /**
   * Creates a connected Stripe Express account for an influencer.
   */
  async createAccount(email: string): Promise<Stripe.Response<Stripe.Account>> {
    return await StripeService.stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email,
      capabilities: {
        transfers: { requested: true },
      },
    });
  }

  /**
   * Generates a link for onboarding a connected account.
   */
  async createAccountLink(accountId: string): Promise<string> {
    const accountLink = await StripeService.stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'https://rociny.com/onboarding/refresh',
      return_url: 'https://rociny.com/onboarding/complete',
      type: 'account_onboarding',
    });
    return accountLink.url;
  }

  /**
   * Checks if a connected account has completed all required onboarding steps.
   */
  async isAccountCompleted(stripeAccountId: string): Promise<boolean> {
    const account =
      await StripeService.stripe.accounts.retrieve(stripeAccountId);
    return (
      account.details_submitted === true &&
      account.charges_enabled === true &&
      account.payouts_enabled === true
    );
  }

  /**
   * Generates a login link to Stripe Express dashboard.
   */
  async createLoginLink(accountId: string): Promise<string> {
    const loginLink =
      await StripeService.stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  }

  /**
   * Sets VAT number for a connected account and ensures a 20% VAT tax rate exists.
   */
  async setConnectedVat(accountId: string, vatNumber: string): Promise<void> {
    // Remove old VAT
    const list = await StripeService.stripe.taxIds.list(
      { limit: 100 },
      { stripeAccount: accountId },
    );
    if (list.data.length > 0) {
      await StripeService.stripe.taxIds.del(list.data[0].id, {
        stripeAccount: accountId,
      });
    }

    // Create new VAT number
    await StripeService.stripe.taxIds.create(
      { type: 'eu_vat', value: vatNumber },
      { stripeAccount: accountId },
    );

    // Ensure VAT rate exists
    const rates = await StripeService.stripe.taxRates.list(
      { limit: 1 },
      { stripeAccount: accountId },
    );
    if (rates.data.length === 0) {
      await StripeService.stripe.taxRates.create(
        {
          display_name: 'TVA',
          description: '20% VAT (France)',
          percentage: 20,
          inclusive: false,
        },
        { stripeAccount: accountId },
      );
    }
  }

  /**
   * Checks if a connected account already has a VAT number set.
   */
  async hasConnectedVat(accountId: string) {
    const list = await StripeService.stripe.taxIds.list(
      { limit: 100 },
      { stripeAccount: accountId },
    );
    return list.data.some((t) => t.type === 'eu_vat');
  }

  /**
   * Sets VAT number for a Stripe customer.
   */
  async setCustomerVat(customerId: string, vatNumber: string) {
    // Remove existing VAT
    const list = await StripeService.stripe.customers.listTaxIds(customerId, {
      limit: 100,
    });
    for (const tax of list.data) {
      if (tax.type === 'eu_vat') {
        await StripeService.stripe.customers.deleteTaxId(customerId, tax.id);
      }
    }

    // Add new VAT
    const taxId = await StripeService.stripe.customers.createTaxId(customerId, {
      type: 'eu_vat',
      value: vatNumber,
    });

    return taxId.id;
  }

  /**
   * Checks if a Stripe customer has a VAT number.
   */
  async hasCustomerVat(customerId: string) {
    const list = await StripeService.stripe.customers.listTaxIds(customerId, {
      limit: 100,
    });
    return list.data.some((t) => t.type === 'eu_vat');
  }

  /**
   * Updates a Stripe customer's billing address.
   */
  async setCustomerBillingAddress(
    accountId: string,
    city: string,
    street: string,
    postalCode: string,
  ) {
    await StripeService.stripe.customers.update(accountId, {
      address: { line1: street, city, postal_code: postalCode, country: 'FR' },
    });
  }

  /**
   * Updates a Stripe customer's trade name.
   */
  async setCustomerTradeName(accountId: string, tradeName: string) {
    await StripeService.stripe.customers.update(accountId, { name: tradeName });
  }

  /**
   * Creates a new Stripe customer.
   */
  async createCustomer(
    email: string,
  ): Promise<Stripe.Response<Stripe.Customer>> {
    return await StripeService.stripe.customers.create({ email });
  }

  /**
   * Creates a SetupIntent for saving a payment method.
   */
  async createSetupIntent(
    customerId: string,
  ): Promise<Stripe.Response<Stripe.SetupIntent>> {
    return await StripeService.stripe.setupIntents.create({
      customer: customerId,
    });
  }

  /**
   * Checks if a customer has a card payment method attached.
   */
  async hasCardPaymentMethod(customerId: string): Promise<boolean> {
    const paymentMethods = await StripeService.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data.length > 0;
  }

  /**
   * Creates an ephemeral key for mobile client authentication.
   */
  async createEphemeralKey(customerId: string): Promise<Stripe.EphemeralKey> {
    return await StripeService.stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2025-04-30.basil' },
    );
  }

  /**
   * Creates a Billing Portal session for a customer.
   */
  async createBillingPortalSession(customerId: string): Promise<string> {
    const session = await StripeService.stripe.billingPortal.sessions.create({
      customer: customerId,
    });
    return session.url;
  }

  /**
   * Creates a PaymentIntent for a collaboration.
   */
  async createPaymentIntent(
    collaborationId: number,
    amount: number,
    customerId: string,
  ): Promise<{
    paymentIntentId: string;
    clientSecret: string;
    ephemeralKey: string;
  }> {
    const amountMinor = Math.round(amount * 100);
    const pi = await StripeService.stripe.paymentIntents.create(
      {
        amount: amountMinor,
        currency: 'eur',
        customer: `${customerId}`,
        automatic_payment_methods: { enabled: true },
        transfer_group: `collaboration_${collaborationId}`,
        metadata: {
          collaborationId,
          purpose: 'supply_collaboration',
          appCustomerId: String(customerId),
        },
      },
      {
        idempotencyKey: `supply_collaboration_${collaborationId}_${amountMinor}`,
      },
    );

    const ephemeralKey = await StripeService.stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2025-04-30.basil' },
    );

    return {
      paymentIntentId: pi.id,
      clientSecret: pi.client_secret,
      ephemeralKey: ephemeralKey.secret,
    };
  }

  /**
   * Transfers funds to an influencer's connected account.
   */
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
        destination,
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

  /**
   * Retrieves platform Stripe balance.
   */
  async getBalance(currency: string = 'eur'): Promise<any> {
    return await StripeService.stripe.balance.retrieve();
  }

  /**
   * Creates an invoice for Rociny's commission, including platform VAT number.
   */
  async createPlatformInvoice(
    customerId: string,
    amount: number,
    isQuote: boolean = false,
  ) {
    const amountCents = Math.round(amount * 100);

    const invoice = await StripeService.stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      custom_fields: [{ name: 'TVA', value: StripeService.platformVATNumber }],
      ...(isQuote
        ? { footer: 'Ce document est un devis et ne vaut pas facture.' }
        : {}),
    });

    await StripeService.stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      currency: 'eur',
      amount: amountCents,
      tax_rates: [StripeService.taxRateId],
      description: isQuote ? 'Commission (devis)' : 'Commission',
    });

    const finalized = await StripeService.stripe.invoices.finalizeInvoice(
      invoice.id,
    );

    await StripeService.stripe.invoices.pay(finalized.id, {
      paid_out_of_band: true,
    });

    return {
      id: finalized.id,
      url: finalized.hosted_invoice_url,
      pdf: finalized.invoice_pdf,
    };
  }

  /**
   * Creates an invoice in an influencer's connected account for a collaboration.
   */
  async createInfluencerInvoice(
    company: CompanyEntity,
    influencer: InfluencerEntity,
    placements: ProductPlacementEntity[],
    isQuote: boolean = false,
  ) {
    let taxRateId: string | undefined;

    // Get tax rate if influencer has VAT
    if (influencer.vatNumber) {
      const existingRates = await StripeService.stripe.taxRates.list(
        { active: true },
        { stripeAccount: influencer.stripeAccountId },
      );
      if (existingRates.data.length > 0) {
        taxRateId = existingRates.data[0].id;
      }
    }

    // Create customer in influencer's account
    const customer = await StripeService.stripe.customers.create(
      {
        name: company.tradeName,
        email: 'developer@rociny.com',
        address: {
          city: company.city,
          line1: company.street,
          postal_code: company.postalCode,
          country: 'FR',
        },
        tax_id_data: company.vatNumber
          ? [{ type: 'eu_vat', value: company.vatNumber }]
          : undefined,
      },
      { stripeAccount: influencer.stripeAccountId },
    );

    // Create invoice
    const invoice = await StripeService.stripe.invoices.create(
      {
        customer: customer.id,
        collection_method: 'send_invoice',
        days_until_due: 30,
        ...(isQuote
          ? { footer: 'Ce document est un devis et ne vaut pas facture.' }
          : {}),
        ...(influencer.vatNumber
          ? {
              custom_fields: [
                { name: 'Numéro de TVA', value: company.vatNumber },
              ],
            }
          : {}),
      },
      { stripeAccount: influencer.stripeAccountId },
    );

    // Add product placements
    for (const placement of placements) {
      const description = this.mapPlacementTypeToLabel(placement.type);
      const amountCents = Math.round(placement.price * 100);
      await StripeService.stripe.invoiceItems.create(
        {
          customer: customer.id,
          invoice: invoice.id,
          currency: 'eur',
          amount: amountCents,
          description: isQuote ? `${description} (devis)` : description,
          ...(taxRateId ? { tax_rates: [taxRateId] } : {}),
        },
        { stripeAccount: influencer.stripeAccountId },
      );
    }

    // Finalize invoice
    const finalized = await StripeService.stripe.invoices.finalizeInvoice(
      invoice.id,
      { stripeAccount: influencer.stripeAccountId },
    );

    await StripeService.stripe.invoices.pay(
      finalized.id,
      { paid_out_of_band: true },
      { stripeAccount: influencer.stripeAccountId },
    );

    return {
      id: finalized.id,
      url: finalized.hosted_invoice_url,
      pdf: finalized.invoice_pdf,
    };
  }

  /**
   * Maps product placement types to human-readable labels for invoice descriptions.
   */
  private mapPlacementTypeToLabel(type: string): string {
    switch (type) {
      case 'post':
        return 'Publication Instagram';
      case 'reel':
        return 'Vidéo Reels';
      case 'story':
        return 'Story Instagram';
      case 'concours':
        return 'Organisation de concours';
      default:
        return type;
    }
  }
}
