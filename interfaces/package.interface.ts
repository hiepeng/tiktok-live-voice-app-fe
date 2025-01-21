export enum SubscriptionType {
  FREE = 'free',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  CUSTOM = 'custom'
}

export interface Package {
  id: string;
  type: SubscriptionType;
  name: string;
  price: number;
  features: string[];
  maxDuration: number;
  maxConcurrentStreams: number;
}

export const PACKAGES: Package[] = [
  {
    id: '1',
    type: SubscriptionType.FREE,
    name: 'Free',
    price: 0,
    maxDuration: 5,
    maxConcurrentStreams: 1,
    features: [
      '5 minutes per stream',
      '1 concurrent stream',
      'Basic features'
    ]
  },
  {
    id: '2',
    type: SubscriptionType.BASIC,
    name: 'Basic',
    price: 9.99,
    maxDuration: 30,
    maxConcurrentStreams: 2,
    features: [
      '30 minutes per stream',
      '2 concurrent streams',
      'Advanced features'
    ]
  },
  {
    id: '3',
    type: SubscriptionType.STANDARD,
    name: 'Standard',
    price: 19.99,
    maxDuration: 60,
    maxConcurrentStreams: 3,
    features: [
      '60 minutes per stream',
      '3 concurrent streams',
      'Premium features'
    ]
  },
  {
    id: '4',
    type: SubscriptionType.PREMIUM,
    name: 'Premium',
    price: 29.99,
    maxDuration: -1,
    maxConcurrentStreams: 5,
    features: [
      'Unlimited stream duration',
      '5 concurrent streams',
      'All features included'
    ]
  }
];
