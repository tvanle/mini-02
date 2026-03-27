import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { RootStackParamList } from '../types';
import { authService } from '../services/auth.service';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('concierge@luxury.vn');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    const res = await authService.login({ username, password });
    setLoading(false);
    if (!res.success) {
      Alert.alert('Lỗi', res.error || 'Đăng nhập thất bại');
      return;
    }
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.fingerWrap}>
          <Ionicons name="finger-print" size={40} color="#4338ca" />
        </View>

        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Chào mừng bạn quay lại với trải nghiệm dịch vụ cao cấp.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>TÊN ĐĂNG NHẬP</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person" size={16} color="#4b5563" />
            <TextInput
              style={styles.input}
              placeholder="concierge@luxury.vn"
              placeholderTextColor="#9ca3af"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>MẬT KHẨU</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed" size={16} color="#4b5563" />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color="#4b5563" />
            </Pressable>
          </View>

          <Pressable style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </Pressable>

          <Pressable onPress={onLogin} disabled={loading}>
            <LinearGradient colors={['#3126cf', '#5146ef']} style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>{loading ? 'Đang xử lý...' : 'Login'}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerHint}>Chưa có tài khoản? </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Đăng ký ngay →</Text>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>HOẶC ĐĂNG NHẬP VỚI</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialBtn}>
            <Text style={styles.socialEmoji}>🪪</Text>
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable style={styles.socialBtn}>
            <MaterialCommunityIcons name="apple" size={16} color="#111827" />
            <Text style={styles.socialText}>Apple</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>THE DIGITAL CONCIERGE © 2024</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 18 },
  fingerWrap: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: '#e9e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  title: { fontSize: 52, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  form: { marginTop: 20 },
  label: { fontSize: 15, color: '#374151', fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  inputWrap: {
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
    height: 60,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, fontSize: 26, color: '#111827' },
  forgotWrap: { alignSelf: 'flex-end', marginTop: 10 },
  forgotText: { color: '#4338ca', fontWeight: '600', fontSize: 15 },
  loginBtn: {
    marginTop: 16,
    borderRadius: 14,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4338ca',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 32 },
  registerRow: { marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  registerHint: { color: '#374151', fontSize: 17 },
  registerLink: { color: '#4338ca', fontWeight: '700', fontSize: 17 },
  dividerRow: { marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#d1d5db' },
  dividerText: { color: '#6b7280', fontSize: 12, letterSpacing: 1.5, fontWeight: '700' },
  socialRow: { marginTop: 16, flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  socialEmoji: { fontSize: 16 },
  socialText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  footer: { marginTop: 'auto', textAlign: 'center', color: '#6b7280', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
});
