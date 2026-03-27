import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Showtime } from '../types';
import { showtimeService } from '../services/showtime.service';
import { getCurrentUser } from '../utils/session';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatSelection'>;

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function SeatSelectionScreen({ route, navigation }: Props) {
  const { showtimeId } = route.params;
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const [stRes, seatsRes] = await Promise.all([
        showtimeService.getById(showtimeId),
        showtimeService.getBookedSeats(showtimeId),
      ]);
      if (stRes.success && stRes.data) setShowtime(stRes.data);
      if (seatsRes.success && seatsRes.data) setBookedSeats(seatsRes.data);
    })();
  }, [showtimeId]);

  const toggleSeat = (seat: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const onContinue = async () => {
    if (selectedSeats.length === 0) return;

    const user = await getCurrentUser();
    if (!user) {
      Alert.alert('Cần đăng nhập', 'Bạn phải đăng nhập để đặt vé.', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    // Navigate to Payment screen
    navigation.navigate('Payment', {
      showtimeId,
      seats: selectedSeats,
    });
  };

  const clearSelection = () => setSelectedSeats([]);

  if (!showtime) return null;

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const totalPrice = selectedSeats.length * showtime.price;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Movie info */}
        <View style={styles.infoCard}>
          <Text style={styles.movieTitle}>{showtime.movieTitle}</Text>
          <Text style={styles.theater}>{showtime.theaterName}</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoBadge}>
              <Ionicons name="calendar-outline" size={14} color="#4338ca" />
              <Text style={styles.infoText}>{formatDate(showtime.showDate)}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Ionicons name="time-outline" size={14} color="#4338ca" />
              <Text style={styles.infoText}>{showtime.showTime}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.priceText}>{showtime.price.toLocaleString('vi-VN')}đ/ghế</Text>
            </View>
          </View>
        </View>

        {/* Screen indicator */}
        <View style={styles.screenIndicator}>
          <Text style={styles.screenText}>MÀN HÌNH</Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatAvailable]} />
            <Text style={styles.legendLabel}>Trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatSelected]} />
            <Text style={styles.legendLabel}>Đang chọn</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatBooked]} />
            <Text style={styles.legendLabel}>Đã đặt</Text>
          </View>
        </View>

        {/* Selected seats count */}
        {selectedSeats.length > 0 && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedCount}>Đã chọn {selectedSeats.length} ghế</Text>
            <Pressable onPress={clearSelection}>
              <Text style={styles.clearText}>Xoá tất cả</Text>
            </Pressable>
          </View>
        )}

        {/* Seats grid */}
        <View style={styles.seatsContainer}>
          {ROWS.map((row) => (
            <View key={row} style={styles.seatRow}>
              <Text style={styles.rowLabel}>{row}</Text>
              {COLS.map((col) => {
                const seat = `${row}${col}`;
                const isBooked = bookedSeats.includes(seat);
                const isSelected = selectedSeats.includes(seat);
                return (
                  <Pressable
                    key={seat}
                    style={[
                      styles.seat,
                      isBooked && styles.seatBooked,
                      isSelected && styles.seatSelected,
                      !isBooked && !isSelected && styles.seatAvailable,
                    ]}
                    disabled={isBooked}
                    onPress={() => toggleSeat(seat)}
                  >
                    <Text style={[styles.seatText, isBooked && styles.seatTextBooked, isSelected && styles.seatTextSelected]}>
                      {col}
                    </Text>
                  </Pressable>
                );
              })}
              <Text style={styles.rowLabel}>{row}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Booking bar - Fixed at bottom */}
      {selectedSeats.length > 0 && (
        <View style={styles.bookingBar}>
          <View style={styles.bookingInfo}>
            <View style={styles.seatsPreview}>
              {selectedSeats.slice(0, 4).map((seat, i) => (
                <View key={seat} style={styles.seatTag}>
                  <Text style={styles.seatTagText}>{seat}</Text>
                </View>
              ))}
              {selectedSeats.length > 4 && (
                <Text style={styles.moreSeats}>+{selectedSeats.length - 4}</Text>
              )}
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{selectedSeats.length} vé × {showtime.price.toLocaleString('vi-VN')}đ</Text>
              <Text style={styles.totalPrice}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
          <Pressable style={styles.bookBtn} onPress={onContinue}>
            <Text style={styles.bookBtnText}>Tiếp tục</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 120 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  movieTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  theater: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  infoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  infoText: { fontSize: 13, fontWeight: '600', color: '#4338ca' },
  priceText: { fontSize: 13, fontWeight: '700', color: '#312e81' },
  screenIndicator: {
    backgroundColor: '#c7d2fe', borderRadius: 8, paddingVertical: 8, marginBottom: 20, alignItems: 'center',
  },
  screenText: { fontSize: 12, fontWeight: '700', color: '#4338ca', letterSpacing: 4 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendBox: { width: 24, height: 24, borderRadius: 6 },
  legendLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  selectedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  selectedCount: { fontSize: 14, fontWeight: '600', color: '#4338ca' },
  clearText: { fontSize: 13, fontWeight: '600', color: '#ef4444' },
  seatsContainer: { gap: 8, alignItems: 'center', marginBottom: 20 },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowLabel: { width: 20, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#6b7280' },
  seat: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  seatAvailable: { backgroundColor: '#e5e7eb' },
  seatSelected: { backgroundColor: '#4338ca' },
  seatBooked: { backgroundColor: '#fca5a5' },
  seatText: { fontSize: 11, fontWeight: '700', color: '#374151' },
  seatTextSelected: { color: '#fff' },
  seatTextBooked: { color: '#991b1b' },
  bookingBar: {
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
  bookingInfo: { flex: 1, marginRight: 12 },
  seatsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  seatTag: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  seatTagText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  moreSeats: { fontSize: 12, fontWeight: '600', color: '#6b7280', alignSelf: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceLabel: { fontSize: 13, color: '#6b7280' },
  totalPrice: { fontSize: 18, fontWeight: '800', color: '#312e81' },
  bookBtn: {
    backgroundColor: '#4338ca',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
