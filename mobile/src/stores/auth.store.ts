import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { authService, setApiToken } from '../services/api';
import type { User } from '../types';

type AuthState = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: { username: string; password: string; fullName: string; email: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  loading: false,

  initialize: async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userRaw = await AsyncStorage.getItem(USER_KEY);

    if (token && userRaw) {
      const user = JSON.parse(userRaw) as User;
      setApiToken(token);
      set({ token, user, isLoggedIn: true });
    }
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      const res = await authService.login({ username, password });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Đăng nhập thất bại');
      }

      const { token, user } = res.data;
      setApiToken(token);
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ token, user, isLoggedIn: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async ({ username, password, fullName, email }) => {
    set({ loading: true });
    try {
      const res = await authService.register({ username, password, fullName, email });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Đăng ký thất bại');
      }

      const { token, user } = res.data;
      setApiToken(token);
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ token, user, isLoggedIn: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    setApiToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isLoggedIn: false });
  },
}));
