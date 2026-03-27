import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { Showtime } from '../types';
import { showtimeService } from '../services/showtime.service';

type Props = {
  navigation: { navigate: (screen: string, params?: object) => void };
};

export function ShowtimesScreen({ navigation }: Props) {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadData = async () => {
    const res = await showtimeService.getAll();
    if (res.success && res.data) setShowtimes(res.data);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const dates = [...new Set(showtimes.map((s) => s.showDate))].sort();
  const filtered = selectedDate ? showtimes.filter((s) => s.showDate === selectedDate) : showtimes;

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  };

  const getDayName = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Lịch Chiếu</Text>

      <FlatList
        horizontal
        data={['Tất cả', ...dates]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateList}
        renderItem={({ item }) => {
          const isAll = item === 'Tất cả';
          const isActive = isAll ? !selectedDate : selectedDate === item;
          return (
            <Pressable
              style={[styles.dateChip, isActive && styles.dateChipActive]}
              onPress={() => setSelectedDate(isAll ? null : item)}
            >
              {isAll ? (
                <Text style={[styles.dateDay, isActive && styles.dateDayActive]}>Tất cả</Text>
              ) : (
                <>
                  <Text style={[styles.dateDayName, isActive && styles.dateDayActive]}>{getDayName(item)}</Text>
                  <Text style={[styles.dateDay, isActive && styles.dateDayActive]}>{formatDate(item)}</Text>
                </>
              )}
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('SeatSelection', { showtimeId: item.id })}
          >
            <Image
              source={{ uri: item.moviePoster || 'https://picsum.photos/seed/st/400/600' }}
              style={styles.poster}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text style={styles.movieTitle} numberOfLines={1}>{item.movieTitle}</Text>
              <Text style={styles.theaterName}>{item.theaterName}</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={13} color="#4338ca" />
                  <Text style={styles.timeText}>{item.showTime}</Text>
                </View>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateText}>{formatDate(item.showDate)}</Text>
                </View>
              </View>
              <Text style={styles.price}>{item.price.toLocaleString('vi-VN')}đ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#c7d2fe" />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 12 },
  dateList: { gap: 8, paddingBottom: 12 },
  dateChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', minWidth: 56,
  },
  dateChipActive: { backgroundColor: '#4338ca', borderColor: '#4338ca' },
  dateDayName: { fontSize: 11, fontWeight: '600', color: '#6b7280' },
  dateDay: { fontSize: 14, fontWeight: '700', color: '#111827' },
  dateDayActive: { color: '#fff' },
  list: { paddingBottom: 100, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 10, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  poster: { width: 60, height: 85, borderRadius: 10, backgroundColor: '#e5e7eb' },
  info: { flex: 1 },
  movieTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  theaterName: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  timeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  timeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  timeText: { fontSize: 12, fontWeight: '700', color: '#4338ca' },
  dateBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dateText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  price: { fontSize: 15, fontWeight: '800', color: '#312e81', marginTop: 4 },
});
