import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Showtime } from '../types';
import { showtimeService } from '../services/showtime.service';
import { ticketService } from '../services/ticket.service';
import { getCurrentUser } from '../utils/session';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

type PaymentMethod = 'momo' | 'zalopay' | 'vnpay' | 'card';

export function PaymentScreen({ route, navigation }: Props) {
  const { showtimeId, seats } = route.params;
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('momo');
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    (async () => {
      const res = await showtimeService.getById(showtimeId);
      if (res.success && res.data) setShowtime(res.data);
    })();
  }, [showtimeId]);

  const paymentMethods: { key: PaymentMethod; name: string; icon: string; color: string }[] = [
    { key: 'momo', name: 'MoMo', icon: 'wallet', color: '#ae2070' },
    { key: 'zalopay', name: 'ZaloPay', icon: 'card', color: '#0068ff' },
    { key: 'vnpay', name: 'VNPay', icon: 'globe', color: '#0066b3' },
    { key: 'card', name: 'Thẻ ngân hàng', icon: 'card-outline', color: '#374151' },
  ];

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const totalPrice = showtime ? seats.length * showtime.price : 0;
  const serviceFee = 5000;
  const finalTotal = totalPrice + serviceFee;

  const onPayment = async () => {
    const user = await getCurrentUser();
    if (!user) {
      Alert.alert('Cần đăng nhập', 'Bạn phải đăng nhập để đặt vé.', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (selectedMethod === 'card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin thẻ');
        return;
      }
    }

    setLoading(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Book all seats
    const results = await Promise.all(
      seats.map((seat) => ticketService.bookTicket(showtimeId, seat))
    );

    setLoading(false);

    const successCount = results.filter((r) => r.success).length;
    const failedSeats = seats.filter((_, i) => !results[i].success);

    if (failedSeats.length > 0 && successCount > 0) {
      Alert.alert(
        'Thanh toán một phần',
        `Đã đặt ${successCount}/${seats.length} vé.\nGhế không đặt được: ${failedSeats.join(', ')}`,
        [{ text: 'Xem vé', onPress: () => navigation.navigate('MyTickets') }]
      );
    } else if (successCount === 0) {
      Alert.alert('Lỗi', results[0]?.error || 'Thanh toán thất bại');
    } else {
      Alert.alert(
        'Thanh toán thành công!',
        `Đã đặt ${successCount} vé thành công.\nTổng tiền: ${finalTotal.toLocaleString('vi-VN')}đ`,
        [{ text: 'Xem vé', onPress: () => navigation.navigate('MyTickets') }]
      );
    }
  };

  if (!showtime) return null;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin đặt vé</Text>
          <View style={styles.movieInfo}>
            <Image
              source={{ uri: showtime.moviePoster || 'https://picsum.photos/seed/payment/400/600' }}
              style={styles.poster}
            />
            <View style={styles.movieDetails}>
              <Text style={styles.movieTitle}>{showtime.movieTitle}</Text>
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={14} color="#6b7280" />
                <Text style={styles.infoText}>{showtime.theaterName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                <Text style={styles.infoText}>{formatDate(showtime.showDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={14} color="#6b7280" />
                <Text style={styles.infoText}>{showtime.showTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.seatsInfo}>
            <Text style={styles.seatsLabel}>Ghế đã chọn</Text>
            <View style={styles.seatsList}>
              {seats.map((seat) => (
                <View key={seat} style={styles.seatTag}>
                  <Text style={styles.seatTagText}>{seat}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
          {paymentMethods.map((method) => (
            <Pressable
              key={method.key}
              style={[styles.methodItem, selectedMethod === method.key && styles.methodItemActive]}
              onPress={() => setSelectedMethod(method.key)}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.color + '15' }]}>
                <Ionicons name={method.icon as any} size={24} color={method.color} />
              </View>
              <Text style={styles.methodName}>{method.name}</Text>
              <View style={[styles.radio, selectedMethod === method.key && styles.radioActive]}>
                {selectedMethod === method.key && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Card Details (if card selected) */}
        {selectedMethod === 'card' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin thẻ</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số thẻ</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9ca3af"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên chủ thẻ</Text>
              <TextInput
                style={styles.input}
                placeholder="NGUYEN VAN A"
                placeholderTextColor="#9ca3af"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Ngày hết hạn</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#9ca3af"
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#9ca3af"
                  value={cardCvv}
                  onChangeText={setCardCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        )}

        {/* Price Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá vé ({seats.length} vé)</Text>
            <Text style={styles.priceValue}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí dịch vụ</Text>
            <Text style={styles.priceValue}>{serviceFee.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Payment Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomPrice}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
        </View>
        <Pressable
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          onPress={onPayment}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.payBtnText}>Đang xử lý...</Text>
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
              <Text style={styles.payBtnText}>Thanh toán</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  movieInfo: { flexDirection: 'row', gap: 14 },
  poster: { width: 80, height: 110, borderRadius: 12, backgroundColor: '#e5e7eb' },
  movieDetails: { flex: 1, justifyContent: 'center' },
  movieTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { fontSize: 13, color: '#6b7280' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  seatsInfo: {},
  seatsLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  seatsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seatTag: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  seatTagText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  methodItemActive: { borderColor: '#4338ca', backgroundColor: '#eef2ff' },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  methodName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#374151' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: { borderColor: '#4338ca' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4338ca' },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  inputRow: { flexDirection: 'row' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: '#6b7280' },
  priceValue: { fontSize: 14, fontWeight: '600', color: '#374151' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#4338ca' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  bottomInfo: { flex: 1 },
  bottomLabel: { fontSize: 13, color: '#6b7280' },
  bottomPrice: { fontSize: 22, fontWeight: '800', color: '#312e81' },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4338ca',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
  },
  payBtnDisabled: { backgroundColor: '#9ca3af' },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
