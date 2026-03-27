import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Order, RootStackParamList } from '../types';
import { orderService } from '../services/order.service';
import { getCurrentUserId } from '../utils/session';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'momo'>('vnpay');

  useEffect(() => {
    (async () => {
      const pending = await orderService.getPendingOrder();
      if (pending.success && pending.data) setOrder(pending.data);
    })();
  }, []);

  const onCheckout = async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để thanh toán đơn hàng', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    const res = await orderService.checkout();
    if (!res.success) {
      Alert.alert('Lỗi', res.error || 'Checkout thất bại');
      return;
    }
    Alert.alert('Thanh toán thành công', `Đơn hàng của bạn đã được tạo và thanh toán thành công.\nTổng: $${total.toFixed(2)}`);
    navigation.replace('OrderHistory');
  };

  const subtotal = (order?.totalAmount ?? 0) / 23000;
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Checkout</Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={18} color="#6b7280" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Pressable>
            <Text style={styles.edit}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.addressCard}>
          <View style={styles.pinWrap}>
            <Ionicons name="location" size={16} color="#4338ca" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressTitle}>Home</Text>
            <Text style={styles.addressText}>123 Luxury Avenue, Suite 405</Text>
            <Text style={styles.addressText}>Chelsea, London, SW3 4LY</Text>
            <Text style={styles.addressText}>United Kingdom</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Order Items</Text>
        {(order?.items ?? []).map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Image
              source={{ uri: item.productImage || 'https://picsum.photos/seed/checkout-fallback/200/200' }}
              style={styles.itemImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemMeta}>Size: 42 • Color: Midnight Red</Text>
              <Text style={styles.itemPrice}>${(item.subtotal / 23000).toFixed(2)}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentRow}>
          <Pressable
            style={[styles.paymentCard, paymentMethod === 'vnpay' && styles.paymentCardActive]}
            onPress={() => setPaymentMethod('vnpay')}
          >
            <View style={styles.paymentLogo}>
              <Text style={styles.paymentLogoText}>VNPAY</Text>
            </View>
            <Text style={styles.paymentLabel}>VNPay</Text>
            {paymentMethod === 'vnpay' ? <Ionicons name="checkmark-circle" size={18} color="#4338ca" style={styles.check} /> : null}
          </Pressable>
          <Pressable
            style={[styles.paymentCard, paymentMethod === 'momo' && styles.paymentCardActive]}
            onPress={() => setPaymentMethod('momo')}
          >
            <View style={[styles.paymentLogo, { backgroundColor: '#ec4899' }]}>
              <Text style={[styles.paymentLogoText, { color: '#fff' }]}>MOMO</Text>
            </View>
            <Text style={styles.paymentLabel}>MoMo</Text>
            {paymentMethod === 'momo' ? <Ionicons name="checkmark-circle" size={18} color="#4338ca" style={styles.check} /> : null}
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: '#15803d' }]}>Free</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (0%)</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalText}>Total Amount</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Pressable style={styles.confirmBtn} onPress={onCheckout}>
          <Text style={styles.confirmText}>Confirm Payment</Text>
          <Ionicons name="lock-closed" size={14} color="#fff" />
        </Pressable>
        <Text style={styles.secure}>SECURED BY 256-BIT SSL ENCRYPTION</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: { width: 28, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  content: { padding: 16, paddingBottom: 140, gap: 12 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  edit: { color: '#4338ca', fontWeight: '600' },
  addressCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10 },
  pinWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addressTitle: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  addressText: { color: '#4b5563', fontSize: 13, lineHeight: 18 },
  itemCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  itemImage: { width: 58, height: 58, borderRadius: 10, backgroundColor: '#e5e7eb' },
  itemName: { fontSize: 17, fontWeight: '700', color: '#111827' },
  itemMeta: { color: '#6b7280', marginTop: 2, fontSize: 12 },
  itemPrice: { marginTop: 4, color: '#4338ca', fontWeight: '700', fontSize: 24 },
  paymentRow: { flexDirection: 'row', gap: 10 },
  paymentCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    position: 'relative',
    backgroundColor: '#fff',
  },
  paymentCardActive: { borderColor: '#4338ca', backgroundColor: '#eef2ff' },
  paymentLogo: {
    width: 58,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentLogoText: { fontSize: 11, fontWeight: '800', color: '#1e3a8a' },
  paymentLabel: { marginTop: 8, fontWeight: '700', color: '#111827' },
  check: { position: 'absolute', right: 8, top: 8 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#6b7280', fontSize: 14 },
  summaryValue: { color: '#111827', fontSize: 14, fontWeight: '600' },
  line: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  totalText: { fontSize: 24, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 40, fontWeight: '800', color: '#4338ca' },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  confirmBtn: {
    backgroundColor: '#4338ca',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  secure: { marginTop: 8, fontSize: 10, color: '#6b7280', textAlign: 'center', letterSpacing: 0.5 },
});
