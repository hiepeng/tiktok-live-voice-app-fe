import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { ProfileResponse } from '@/services/userInterface';

interface UserState {
  token: string | null;
  _id: string | null;
  email: string | null;
  avatar: string | null;
  subscription?: {
    packageId: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'cancelled';
  };
  validateToken: () => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<string>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface LoginResponse {
  data: {
    accessToken: string;
  }
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      token: null,
      _id: null,
      email: null,
      avatar: null,

      validateToken: async () => {
        const token = get().token;
        if (!token) return false;

        try {
          const res = await api.get<ProfileResponse>('/users/profile', { token });
          set({ 
            _id: res.data._id,
            email: res.data.email,
            avatar: res.data.avatar,
            subscription: res.data.subscription
          });
          return true;
        } catch (error) {
          set({ 
            token: null,
            _id: null,
            email: null,
            avatar: null,
            subscription: undefined
          });
          return false;
        }
      },

      signIn: async (email: string, password: string) => {
        const data = await api.post<LoginResponse>('/auth/login', { email, password });
        set({ token: data.data.accessToken });
        return data.data.accessToken;
      },

      signUp: async (email: string, password: string) => {
        await api.post('/users', { email, password });
      },

      signOut: async () => {
        set({ 
          token: null,
          _id: null,
          email: null,
          avatar: null,
          subscription: undefined
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
