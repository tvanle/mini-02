import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../stores/auth.store';

export function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    try {
      await register({
        username: username.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Đăng ký thất bại');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.banner}>
        <Text style={styles.bannerTitle}>Create your account</Text>
        <Text style={styles.bannerText}>Bắt đầu trải nghiệm mua sắm theo dashboard hiện đại.</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.title}>Đăng ký</Text>

        <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" placeholderTextColor="#94a3b8" />
        <TextInput placeholder="Họ tên" value={fullName} onChangeText={setFullName} style={styles.input} placeholderTextColor="#94a3b8" />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#94a3b8" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholderTextColor="#94a3b8" />

        <TouchableOpacity style={styles.button} onPress={onRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Đăng ký'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f4f6ff' },
  banner: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#5b21b6',
    shadowOffset: { width: 0, height: 12 },
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
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 12 },
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
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
