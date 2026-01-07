export class StripeCustomerNotFoundError extends Error {
  constructor(customerId?: string) {
    super(
      customerId
        ? `Stripe customer not found: ${customerId}`
        : 'Stripe customer not found',
    );
    this.name = 'StripeCustomerNotFoundError';
  }
}
