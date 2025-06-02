import { create } from 'zustand';
import { api } from '../services/api';
import { Package, SubscriptionType } from '../interfaces/package.interface';
import PaymentService from '../services/PaymentService';

interface CurrentPackage extends Package {
  endDate?: Date;
}

interface SubscriptionState {
  currentSubscription: CurrentPackage | null;
  isLoading: boolean;
  isPurchasing: boolean;
  error: string | null;
  packages: Package[];
  
  fetchCurrentSubscription: () => Promise<void>;
  fetchPackages: () => Promise<void>;
  setPurchasing: (loading: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  currentSubscription: null,
  isLoading: false,
  isPurchasing: false,
  error: null,
  packages: [],

  setPurchasing: (loading: boolean) => set({ isPurchasing: loading }),

  fetchCurrentSubscription: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get<CurrentPackage>('/subscriptions/current');
      const subscription = response;
      if (subscription.endDate) {
        subscription.endDate = new Date(subscription.endDate);
      }
      set({ currentSubscription: subscription, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch subscription' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPackages: async () => {
    try {
      set({ isLoading: true });
      const packages = await PaymentService.getActivePackages();
      set({ packages, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch packages' });
    } finally {
      set({ isLoading: false });
    }
  },
})); 