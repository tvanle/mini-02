import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      <Text style={styles.title}>Xin chào, {user?.fullName ?? user?.username}</Text>
      <Text style={styles.subtitle}>Chọn danh mục để bắt đầu mua sắm</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Categories')}>
        <Text style={styles.buttonText}>Xem danh mục</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748b', marginBottom: 24, textAlign: 'center' },
  button: { backgroundColor: '#6366f1', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 14 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
