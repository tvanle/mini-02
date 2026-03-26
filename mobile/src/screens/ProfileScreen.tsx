import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      <Text style={styles.title}>{user?.fullName}</Text>
      <Text style={styles.text}>@{user?.username}</Text>
      <Text style={styles.text}>{user?.email}</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OrderHistory')}>
        <Text style={styles.buttonText}>Lịch sử đơn hàng</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logout]} onPress={logout}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  text: { color: '#64748b', marginBottom: 6 },
  button: { marginTop: 16, backgroundColor: '#6366f1', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  logout: { backgroundColor: '#ef4444' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
