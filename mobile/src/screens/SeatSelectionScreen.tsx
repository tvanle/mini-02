import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Showtime } from '../types';
import { showtimeService } from '../services/showtime.service';
import { ticketService } from '../services/ticket.service';
import { getCurrentUser } from '../utils/session';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatSelection'>;

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function SeatSelectionScreen({ route, navigation }: Props) {
  const { showtimeId } = route.params;
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const onBook = async () => {
    if (!selectedSeat) return;

    const user = await getCurrentUser();
    if (!user) {
      Alert.alert('Cần đăng nhập', 'Bạn phải đăng nhập để đặt vé.', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    setLoading(true);
    const res = await ticketService.bookTicket(showtimeId, selectedSeat);
    setLoading(false);

    if (!res.success) {
      Alert.alert('Lỗi', res.error || 'Đặt vé thất bại');
      return;
    }

    Alert.alert('Thành công!', `Đặt vé ghế ${selectedSeat} thành công!`, [
      { text: 'Xem vé', onPress: () => navigation.navigate('MyTickets') },
    ]);
  };

  if (!showtime) return null;

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

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
              <Text style={styles.priceText}>{showtime.price.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
        </View>

        {/* Screen indicator */}
        <View style={styles.screenIndicator}>
          <Text style={styles.screenText}>MAN HINH</Text>
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

        {/* Seats grid */}
        <View style={styles.seatsContainer}>
          {ROWS.map((row) => (
            <View key={row} style={styles.seatRow}>
              <Text style={styles.rowLabel}>{row}</Text>
              {COLS.map((col) => {
                const seat = `${row}${col}`;
                const isBooked = bookedSeats.includes(seat);
                const isSelected = selectedSeat === seat;
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
                    onPress={() => setSelectedSeat(isSelected ? null : seat)}
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

        {/* Booking bar */}
        {selectedSeat && (
          <View style={styles.bookingBar}>
            <View>
              <Text style={styles.bookSeatLabel}>Ghế: {selectedSeat}</Text>
              <Text style={styles.bookPrice}>{showtime.price.toLocaleString('vi-VN')}đ</Text>
            </View>
            <Pressable style={styles.bookBtn} onPress={onBook} disabled={loading}>
              <Text style={styles.bookBtnText}>{loading ? 'Đang đặt...' : 'Đặt vé'}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 40 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  movieTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  theater: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  infoRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  infoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  infoText: { fontSize: 13, fontWeight: '600', color: '#4338ca' },
  priceText: { fontSize: 13, fontWeight: '700', color: '#312e81' },
  screenIndicator: {
    backgroundColor: '#c7d2fe', borderRadius: 6, paddingVertical: 6, marginBottom: 16, alignItems: 'center',
  },
  screenText: { fontSize: 11, fontWeight: '700', color: '#4338ca', letterSpacing: 3 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 20, height: 20, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: '#6b7280' },
  seatsContainer: { gap: 6, alignItems: 'center', marginBottom: 20 },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowLabel: { width: 16, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#6b7280' },
  seat: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  seatAvailable: { backgroundColor: '#e5e7eb' },
  seatSelected: { backgroundColor: '#4338ca' },
  seatBooked: { backgroundColor: '#fca5a5' },
  seatText: { fontSize: 10, fontWeight: '700', color: '#374151' },
  seatTextSelected: { color: '#fff' },
  seatTextBooked: { color: '#991b1b' },
  bookingBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  bookSeatLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  bookPrice: { fontSize: 18, fontWeight: '800', color: '#312e81', marginTop: 2 },
  bookBtn: {
    backgroundColor: '#4338ca', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
