import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useCartStore } from '../stores/cart.store';
import type { Order } from '../types';

export function OrderHistoryScreen() {
  const { orderHistory, fetchHistory } = useCartStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (orderHistory.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Chưa có đơn hàng đã thanh toán</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={orderHistory}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }: { item: Order }) => (
        <View style={styles.card}>
          <Text style={styles.title}>Đơn #{item.id}</Text>
          <Text style={styles.text}>Ngày tạo: {new Date(item.createdAt).toLocaleString()}</Text>
          <Text style={styles.text}>Tổng tiền: {item.totalAmount.toLocaleString('vi-VN')} đ</Text>
          <Text style={styles.status}>Trạng thái: {item.status}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#64748b', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  text: { marginTop: 4, color: '#64748b' },
  status: { marginTop: 4, color: '#16a34a', fontWeight: '600' },
});
