import { create } from 'zustand';
import { api } from '../services/api';

interface SubscriptionPlan {
  type: string;
  name: string;
  maxDuration: number;
  maxConcurrentStreams: number;
  price: number | null;
  features: string[];
}

interface SubscriptionState {
  currentPlan: SubscriptionPlan | null;
  availablePlans: SubscriptionPlan[];
  fetchCurrentPlan: () => Promise<void>;
  fetchAvailablePlans: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  currentPlan: null,
  availablePlans: [],
  
  fetchCurrentPlan: async () => {
    try {
      const response = await api.get('/subscriptions/current');
      set({ currentPlan: response.data });
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
    }
  },

  fetchAvailablePlans: async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      set({ availablePlans: response.data });
    } catch (error) {
      console.error('Failed to fetch available plans:', error);
    }
  },
})); 