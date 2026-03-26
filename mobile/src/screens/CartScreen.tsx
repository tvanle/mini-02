import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, OrderItem, RootStackParamList } from '../types';
import { useCartStore } from '../stores/cart.store';

type CartNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Cart'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: CartNav;
};

export function CartScreen({ navigation }: Props) {
  const { currentOrder, fetchHistory, removeItem } = useCartStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (!currentOrder || currentOrder.items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={currentOrder.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: OrderItem }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemName}>{item.productName}</Text>
            <Text style={styles.itemInfo}>SL: {item.quantity}</Text>
            <Text style={styles.itemInfo}>{item.subtotal.toLocaleString('vi-VN')} đ</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={styles.removeText}>Xoá</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Tổng: {currentOrder.totalAmount.toLocaleString('vi-VN')} đ</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#64748b' },
  itemCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  itemInfo: { marginTop: 4, color: '#64748b' },
  removeText: { marginTop: 8, color: '#ef4444', fontWeight: '600' },
  footer: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12 },
  total: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  checkoutButton: { backgroundColor: '#16a34a', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
