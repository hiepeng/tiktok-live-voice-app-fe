import { create } from 'zustand';
import { api } from '../services/api';
import { SubscriptionType } from '../interfaces/package.interface';



interface SubscriptionState {
  currentSubscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  packages: Package[];
  
  fetchCurrentSubscription: () => Promise<void>;
  purchaseSubscription: (type: SubscriptionType, durationMonths: 1 | 6 | 12) => Promise<void>;
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
      const response = await api.get('/subscriptions/current');
      set({ currentSubscription: response.data, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch subscription' });
    } finally {
      set({ isLoading: false });
    }
  },

  purchaseSubscription: async (type: SubscriptionType, durationMonths: 1 | 6 | 12) => {
    try {
      set({ isLoading: true });
      await api.post('/subscriptions/purchase', { type, durationMonths });
      await get().fetchCurrentSubscription();
    } catch (error) {
      set({ error: 'Failed to purchase subscription' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPackages: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get<Package[]>('/packages');
      set({ packages: response.data, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch packages' });
    } finally {
      set({ isLoading: false });
    }
  },
})); 