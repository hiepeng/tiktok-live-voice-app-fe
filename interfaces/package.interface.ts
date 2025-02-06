export enum SubscriptionType {
  FREE = 'free',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  CUSTOM = 'custom'
}

export interface Package {
  _id: string;
  name: string;
  type: SubscriptionType;
  price: number;
  maxDuration: number;
  maxConcurrentStreams: number;
  features: string[];
  endDate?: Date;
}

export interface Subscription {
  type: SubscriptionType;
  maxDuration: number;
  maxConcurrentStreams: number;
  startDate: string;
  endDate?: string;
}