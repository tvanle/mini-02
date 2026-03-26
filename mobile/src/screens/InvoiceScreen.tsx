import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Invoice'>;

export function InvoiceScreen({ route, navigation }: Props) {
  const { order } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoá đơn #{order.id}</Text>
      <Text style={styles.status}>Trạng thái: {order.status}</Text>

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
      />

      <Text style={styles.total}>Tổng cộng: {order.totalAmount.toLocaleString('vi-VN')} đ</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OrderHistory')}>
        <Text style={styles.buttonText}>Xem lịch sử đơn hàng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  status: { color: '#16a34a', marginBottom: 14, fontWeight: '600' },
  itemRow: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  itemText: { marginTop: 4, color: '#64748b' },
  total: { marginTop: 8, fontSize: 18, fontWeight: '700', color: '#1e293b' },
  button: { marginTop: 14, backgroundColor: '#6366f1', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
