import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../stores/auth.store';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../types';

type ProfileNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: ProfileNav;
};

export function ProfileScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.banner}>
        <Text style={styles.title}>{user?.fullName}</Text>
        <Text style={styles.text}>@{user?.username}</Text>
        <Text style={styles.text}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.card}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OrderHistory')}>
          <Text style={styles.buttonText}>Lịch sử đơn hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logout]} onPress={logout}>
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6ff', gap: 12 },
  banner: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#5b21b6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  text: { color: '#ede9fe', marginBottom: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  button: { backgroundColor: '#6d28d9', borderRadius: 10, paddingVertical: 13, marginBottom: 10, alignItems: 'center' },
  logout: { backgroundColor: '#dc2626', marginBottom: 0 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
