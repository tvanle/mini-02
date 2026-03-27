import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../types';
import { useAuthStore } from '../stores/auth.store';

type Props = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Home'>;
};

export function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7c3aed', '#6d28d9', '#4f46e5']} style={styles.banner}>
        <Text style={styles.bannerTitle}>Welcome back, {user?.fullName ?? user?.username}</Text>
        <Text style={styles.bannerSubtitle}>Khám phá danh mục học tập & thiết bị theo phong cách e-learning.</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Khám phá nhanh</Text>
        <Text style={styles.cardText}>Đi tới danh mục để xem sản phẩm theo từng nhóm.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Categories')}>
          <Text style={styles.buttonText}>Xem danh mục</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6ff', padding: 16, gap: 14 },
  banner: {
    borderRadius: 22,
    padding: 20,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 10,
  },
  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  bannerSubtitle: { color: '#ede9fe', fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  cardText: { fontSize: 14, lineHeight: 20, color: '#64748b', marginBottom: 14 },
  button: {
    backgroundColor: '#6d28d9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
