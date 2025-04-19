import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";
import { ProfileResponse } from "@/services/userInterface";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
// const router = useRouter();

// Đăng ký WebBrowser.maybeCompleteAuthSession
WebBrowser.maybeCompleteAuthSession();

interface UserState {
  token: string | null;
  _id: string | null;
  email: string | null;
  avatar: string | null;
  isAuthenticated: boolean;
  subscription?: {
    packageId: string;
    startDate: string;
    endDate: string;
    status: "active" | "expired" | "cancelled";
  };
  validateToken: () => Promise<boolean>;
  setAuthToken: (token: string) => Promise<void>;
  clearAuthToken: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface LoginResponse {
  accessToken: string;
}

export const useUserStore = create<UserState>()(
  // Bỏ persist để không tự động đồng bộ token vào storage
  (set, get) => ({
    token: null,
    _id: null,
    email: null,
    avatar: null,
    isAuthenticated: false,

    validateToken: async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return false;

      try {
        const res = await api.get<ProfileResponse>("/users/profile");
        console.log(res, "res");
        if (res._id) {
          set({
            _id: res._id,
            email: res.email,
            avatar: res.avatar,
            subscription: res.subscription,
            isAuthenticated: true,
          });
          return true;
        }
        await get().signOut();
        return false;
      } catch (error) {
        console.log(error, "error");
        set({
          token: null,
          _id: null,
          email: null,
          avatar: null,
          subscription: undefined,
          isAuthenticated: false,
        });
        await get().signOut();
        return false;
      }
    },

    signIn: async (email: string, password: string) => {
      const data = await api.post<LoginResponse>("/auth/login", { email, password });
      await get().setAuthToken(data.accessToken);
      await get().validateToken();
      return data.accessToken;
    },

    signUp: async (email: string, password: string) => {
      const res = await api.post("/users", { email, password });
    },

    signOut: async () => {
      // router.replace("/auth/login");
      set({
        token: null,
        _id: null,
        email: null,
        avatar: null,
        subscription: undefined,
        isAuthenticated: false,
      });
      await get().clearAuthToken();
    },
    setAuthToken: async (token: string): Promise<void> => {
      await AsyncStorage.setItem("token", token);
      set({
        token,
        isAuthenticated: true,
      });
    },
    clearAuthToken: async () => {
      await AsyncStorage.removeItem("token");
      set({
        token: null,
        isAuthenticated: false,
      });
    },
  }),
);
