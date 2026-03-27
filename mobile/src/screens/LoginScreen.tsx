import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAuthStore } from '../stores/auth.store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');

  const onLogin = async () => {
    try {
      await login(username.trim(), password);
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Đăng nhập thất bại');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7c3aed', '#6d28d9']} style={styles.banner}>
        <Text style={styles.bannerTitle}>Learning Commerce</Text>
        <Text style={styles.bannerText}>Nền tảng mua sắm học tập với giao diện SaaS hiện đại.</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Tiếp tục với tài khoản của bạn</Text>

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6ff', padding: 16, justifyContent: 'center' },
  banner: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  bannerText: { color: '#ede9fe', lineHeight: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 14 },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  button: {
    backgroundColor: '#6d28d9',
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 4,
    marginBottom: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { color: '#6d28d9', textAlign: 'center', fontWeight: '600' },
});
