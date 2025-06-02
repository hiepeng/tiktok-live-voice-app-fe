export enum SubscriptionType {
  FREE = 'free',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  CUSTOM = 'custom'
}

interface PricingPhase {
  recurrenceMode: number;
  priceAmountMicros: string;
  billingCycleCount: number;
  billingPeriod: string;
  priceCurrencyCode: string;
  formattedPrice: string;
}

interface PricingPhases {
  pricingPhaseList: PricingPhase[];
}

interface SubscriptionOffer {
  pricingPhases: PricingPhases;
  offerToken: string;
  offerTags: string[];
  offerId: string | null;
  basePlanId: string;
}

export interface Package {
  _id: string;
  name: string;
  type: SubscriptionType;
  maxDuration: number;
  maxConcurrentStreams: number;
  features: string[];
  endDate?: Date;
  price?: number;
  formattedPrice?: string;
  priceCurrencyCode?: string;
  basePrice: number;
  baseFormattedPrice: string;
  basePriceCurrencyCode: string;
  subscriptionOfferDetails?: SubscriptionOffer[];
}

export interface Subscription {
  _id: string;
  userId: string;
  packageId: string;
  type: SubscriptionType;
  maxDuration: number;
  maxConcurrentStreams: number;
  startDate: string;
  endDate?: string;
}