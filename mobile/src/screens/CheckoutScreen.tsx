import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useCartStore } from '../stores/cart.store';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const currentOrder = useCartStore((state) => state.currentOrder);
  const checkout = useCartStore((state) => state.checkout);

  const onCheckout = async () => {
    try {
      const paidOrder = await checkout();
      navigation.replace('Invoice', { order: paidOrder });
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể thanh toán');
    }
  };

  if (!currentOrder) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Không có đơn hàng để thanh toán</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.banner}>
        <Text style={styles.bannerTitle}>Checkout</Text>
        <Text style={styles.bannerText}>Xác nhận và hoàn tất đơn hàng của bạn.</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>Tổng tiền</Text>
        <Text style={styles.total}>{currentOrder.totalAmount.toLocaleString('vi-VN')} đ</Text>
        <TouchableOpacity style={styles.button} onPress={onCheckout}>
          <Text style={styles.buttonText}>Xác nhận thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6ff', gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6ff' },
  empty: { color: '#64748b', fontSize: 16 },
  banner: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#5b21b6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7,
  },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  bannerText: { color: '#ede9fe' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  label: { color: '#64748b', marginBottom: 6 },
  total: { fontSize: 28, color: '#111827', fontWeight: '800', marginBottom: 14 },
  button: { backgroundColor: '#6d28d9', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
