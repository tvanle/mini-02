import React, { useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { Ticket } from '../types';
import { ticketService } from '../services/ticket.service';

export function MyTicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        const res = await ticketService.getMyTickets();
        if (active && res.success && res.data) setTickets(res.data);
      })();
      return () => { active = false; };
    }, [])
  );

  const formatDate = (d?: string) => {
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Vé Của Tôi</Text>
      <FlatList
        data={tickets}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="ticket-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Chưa có vé nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Image
                source={{ uri: item.moviePoster || 'https://picsum.photos/seed/ticket/400/600' }}
                style={styles.poster}
                resizeMode="cover"
              />
              <View style={styles.info}>
                <Text style={styles.movieTitle} numberOfLines={1}>{item.movieTitle}</Text>
                <Text style={styles.theater}>{item.theaterName}</Text>
                <View style={styles.row}>
                  <View style={styles.badge}>
                    <Ionicons name="calendar-outline" size={12} color="#4338ca" />
                    <Text style={styles.badgeText}>{formatDate(item.showDate)}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Ionicons name="time-outline" size={12} color="#4338ca" />
                    <Text style={styles.badgeText}>{item.showTime}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardBottom}>
              <View style={styles.seatInfo}>
                <Ionicons name="grid-outline" size={16} color="#4338ca" />
                <Text style={styles.seatLabel}>Ghế</Text>
                <Text style={styles.seatValue}>{item.seatNumber}</Text>
              </View>
              <Text style={styles.price}>{(item.price ?? 0).toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 12 },
  list: { paddingBottom: 100, gap: 12 },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 15, color: '#9ca3af' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', padding: 12, gap: 12 },
  poster: { width: 56, height: 80, borderRadius: 10, backgroundColor: '#e5e7eb' },
  info: { flex: 1 },
  movieTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  theater: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  row: { flexDirection: 'row', gap: 6, marginTop: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#4338ca' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginHorizontal: 12 },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  seatInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seatLabel: { fontSize: 13, color: '#6b7280' },
  seatValue: { fontSize: 16, fontWeight: '800', color: '#312e81' },
  price: { fontSize: 16, fontWeight: '800', color: '#312e81' },
});
