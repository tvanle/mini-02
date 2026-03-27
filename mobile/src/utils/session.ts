import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

const USER_KEY = 'current_user';

export async function setCurrentUser(user: User | null): Promise<void> {
  if (!user) {
    await AsyncStorage.removeItem(USER_KEY);
    return;
  }
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getCurrentUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as User;
}

export async function getCurrentUserId(): Promise<number | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}
