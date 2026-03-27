import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Order, RootStackParamList } from '../types';
import { orderService } from '../services/order.service';
import { getCurrentUserId } from '../utils/session';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const [order, setOrder] = useState<Order | null>(null);

  const loadPending = async () => {
    const res = await orderService.getPendingOrder();
    if (res.success && res.data) setOrder(res.data);
    else setOrder(null);
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadPending);
    return unsub;
  }, [navigation]);

  const removeItem = async (id: number) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập để thao tác giỏ hàng', [
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    const res = await orderService.removeItem(id);
    if (!res.success) {
      Alert.alert('Lỗi', res.error || 'Xoá thất bại');
      return;
    }
    loadPending();
  };

  const changeQty = async (id: number, currentQty: number, delta: number) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập để thao tác giỏ hàng', [
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    const nextQty = currentQty + delta;
    const res = await orderService.updateItemQuantity(id, nextQty);
    if (!res.success) {
      Alert.alert('Lỗi', res.error || 'Không cập nhật được số lượng');
      return;
    }
    loadPending();
  };

  const goCheckout = async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để Checkout', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (!order || order.items.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng đang trống');
      return;
    }
    navigation.navigate('Checkout');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="menu" size={18} color="#111827" />
        </Pressable>
        <Text style={styles.topTitle}>My Cart</Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="bag-handle-outline" size={18} color="#111827" />
        </Pressable>
      </View>
      <Text style={styles.title}>Your Cart</Text>
      <Text style={styles.subtitle}>{order?.items.length ?? 0} item(s) selected for checkout</Text>
      <FlatList
        data={order?.items ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image
              source={{ uri: item.productImage || 'https://picsum.photos/seed/cart-fallback/400/400' }}
              style={styles.thumb}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.productName}</Text>
              <Text style={styles.meta}>Onyx Black | Wireless</Text>
              <Text style={styles.price}>${(item.subtotal / 23000).toFixed(2)}</Text>
            </View>
            <View style={styles.rightCol}>
              <Pressable onPress={() => removeItem(item.id)}>
                <Text style={styles.remove}>×</Text>
              </Pressable>
              <View style={styles.qtyControls}>
                <Pressable style={styles.qtyBtn} onPress={() => changeQty(item.id, item.quantity, -1)}>
                  <Ionicons name="remove" size={14} color="#6b7280" />
                </Pressable>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <Pressable style={styles.qtyBtn} onPress={() => changeQty(item.id, item.quantity, 1)}>
                  <Ionicons name="add" size={14} color="#6b7280" />
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="bag-outline" size={28} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptySub}>Thêm sản phẩm từ Explore để bắt đầu mua sắm.</Text>
          </View>
        }
      />
      <View style={styles.summary}>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Subtotal</Text>
          <Text style={styles.sumValue}>${((order?.totalAmount ?? 0) / 23000).toFixed(2)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Shipping</Text>
          <Text style={styles.shipping}>$5.00</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.sumRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${(((order?.totalAmount ?? 0) + 115000) / 23000).toFixed(2)}</Text>
        </View>
        <Pressable style={styles.summaryCheckoutBtn} onPress={goCheckout}>
          <Text style={styles.summaryCheckoutText}>Checkout</Text>
        </Pressable>
      </View>
      <Pressable style={styles.checkoutBtn} onPress={goCheckout}>
        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#f3f4f6' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
  },
  topTitle: { fontSize: 19, fontWeight: '700', color: '#111827' },
  title: { fontSize: 30, fontWeight: '800', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 2, marginBottom: 8, fontSize: 13 },
  listContent: { paddingTop: 8, paddingBottom: 8 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumb: { width: 76, height: 76, borderRadius: 12, backgroundColor: '#e5e7eb' },
  name: { fontWeight: '700', fontSize: 16, color: '#111827' },
  meta: { color: '#6b7280', marginTop: 2, marginBottom: 2 },
  price: { fontSize: 20, color: '#4338ca', fontWeight: '700' },
  rightCol: { alignItems: 'flex-end', gap: 10 },
  remove: { color: '#6b7280', fontSize: 24, lineHeight: 24 },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 8,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { fontWeight: '700', color: '#111827', minWidth: 14, textAlign: 'center' },
  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginVertical: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLabel: { color: '#6b7280', fontSize: 14 },
  sumValue: { color: '#111827', fontWeight: '700', fontSize: 14 },
  shipping: { color: '#15803d', fontWeight: '700', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  totalLabel: { fontSize: 18, fontWeight: '700' },
  totalValue: { fontSize: 28, fontWeight: '800', color: '#4338ca' },
  summaryCheckoutBtn: {
    marginTop: 8,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  summaryCheckoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  checkoutBtn: { backgroundColor: '#4338ca', padding: 14, borderRadius: 12, alignItems: 'center' },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyWrap: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  emptySub: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
});
