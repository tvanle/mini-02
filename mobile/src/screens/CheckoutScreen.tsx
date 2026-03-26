import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
      <Text style={styles.title}>Xác nhận thanh toán</Text>
      <Text style={styles.total}>Tổng tiền: {currentOrder.totalAmount.toLocaleString('vi-VN')} đ</Text>

      <TouchableOpacity style={styles.button} onPress={onCheckout}>
        <Text style={styles.buttonText}>Xác nhận thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#64748b', fontSize: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 16, textAlign: 'center' },
  total: { fontSize: 20, color: '#16a34a', fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  button: { backgroundColor: '#16a34a', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
