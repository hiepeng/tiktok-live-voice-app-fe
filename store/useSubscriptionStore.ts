import { create } from 'zustand';
import { api } from '../services/api';
import { Package, SubscriptionType } from '../interfaces/package.interface';

interface CurrentPackage extends Package {
  endDate?: Date;
}

interface SubscriptionState {
  currentSubscription: CurrentPackage | null;
  isLoading: boolean;
  error: string | null;
  packages: Package[];
  
  fetchCurrentSubscription: () => Promise<void>;
  fetchPackages: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  currentSubscription: null,
  isLoading: false,
  error: null,
  packages: [],

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
      const response = await api.get<Package[]>('/packages');
      set({ packages: response, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch packages' });
    } finally {
      set({ isLoading: false });
    }
  },
})); 