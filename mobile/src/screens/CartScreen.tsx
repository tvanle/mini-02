import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.banner}>
        <Text style={styles.bannerTitle}>Giỏ hàng</Text>
        <Text style={styles.bannerText}>{currentOrder.items.length} sản phẩm đang chờ thanh toán</Text>
      </LinearGradient>

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
        contentContainerStyle={{ paddingBottom: 110 }}
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
  container: { flex: 1, backgroundColor: '#f4f6ff', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6ff' },
  emptyText: { fontSize: 18, color: '#64748b' },
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
  itemCard: {
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
  itemInfo: { marginTop: 4, color: '#64748b' },
  removeText: { marginTop: 8, color: '#ef4444', fontWeight: '600' },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 90,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  total: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10 },
  checkoutButton: { backgroundColor: '#6d28d9', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
