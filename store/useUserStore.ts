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
            avatar: res.data.avatar
          });
          return true;
        } catch (error) {
          set({ 
            token: null,
            _id: null,
            email: null,
            avatar: null
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
        await api.post('/auth/register', { email, password });
      },

      signOut: async () => {
        set({ 
          token: null,
          _id: null,
          email: null,
          avatar: null
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
