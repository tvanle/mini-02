import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Invoice'>;

export function InvoiceScreen({ route, navigation }: Props) {
  const { order } = route.params;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.banner}>
        <Text style={styles.bannerTitle}>Hoá đơn #{order.id}</Text>
        <Text style={styles.bannerText}>Trạng thái: {order.status}</Text>
      </LinearGradient>

      <FlatList
        data={order.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.productName}</Text>
            <Text style={styles.itemText}>SL: {item.quantity}</Text>
            <Text style={styles.itemText}>{item.subtotal.toLocaleString('vi-VN')} đ</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Tổng cộng: {order.totalAmount.toLocaleString('vi-VN')} đ</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OrderHistory')}>
          <Text style={styles.buttonText}>Xem lịch sử đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6ff' },
  banner: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#5b21b6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7,
  },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  bannerText: { color: '#ede9fe', fontWeight: '600' },
  itemRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  itemName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  itemText: { marginTop: 4, color: '#64748b' },
  footer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  total: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 10 },
  button: { backgroundColor: '#6d28d9', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
