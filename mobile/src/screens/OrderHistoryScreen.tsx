import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.banner}>
        <Text style={styles.bannerTitle}>Lịch sử đơn hàng</Text>
        <Text style={styles.bannerText}>Theo dõi các đơn đã hoàn tất của bạn</Text>
      </LinearGradient>

      <FlatList
        data={orderHistory}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }: { item: Order }) => (
          <View style={styles.card}>
            <Text style={styles.title}>Đơn #{item.id}</Text>
            <Text style={styles.text}>Ngày tạo: {new Date(item.createdAt).toLocaleString()}</Text>
            <Text style={styles.text}>Tổng tiền: {item.totalAmount.toLocaleString('vi-VN')} đ</Text>
            <Text style={styles.status}>Trạng thái: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6ff', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6ff' },
  empty: { color: '#64748b', fontSize: 16 },
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
  bannerText: { color: '#ede9fe' },
  card: {
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
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  text: { marginTop: 4, color: '#64748b' },
  status: { marginTop: 4, color: '#16a34a', fontWeight: '700' },
});
