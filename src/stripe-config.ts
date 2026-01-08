export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1SnJrmI2kIUOizBRppwoKIPT',
    name: 'Pro Plugin Subscription',
    description: 'Advanced plugin generation with premium features and priority support',
    mode: 'subscription',
    price: 29.99,
    currency: 'usd',
    interval: 'month'
  },
  {
    priceId: 'price_1SnJsAI2kIUOizBRrEmOCZ71',
    name: 'Enterprise Plugin Subscription',
    description: 'Full-featured plugin generation with unlimited requests and dedicated support',
    mode: 'subscription',
    price: 99.99,
    currency: 'usd',
    interval: 'month'
  }
];