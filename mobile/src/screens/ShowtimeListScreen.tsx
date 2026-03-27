import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Showtime } from '../types';
import { showtimeService } from '../services/showtime.service';

type Props = NativeStackScreenProps<RootStackParamList, 'ShowtimeList'>;

export function ShowtimeListScreen({ route, navigation }: Props) {
  const movieId = route.params?.movieId;
  const theaterId = route.params?.theaterId;
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  useEffect(() => {
    (async () => {
      const res = await showtimeService.getAll(movieId, theaterId);
      if (res.success && res.data) setShowtimes(res.data);
    })();
  }, [movieId, theaterId]);

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={showtimes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Không có lịch chiếu</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('SeatSelection', { showtimeId: item.id })}
          >
            <Image
              source={{ uri: item.moviePoster || 'https://picsum.photos/seed/stl/400/600' }}
              style={styles.poster}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text style={styles.movieTitle} numberOfLines={1}>{item.movieTitle}</Text>
              <Text style={styles.theaterName}>{item.theaterName}</Text>
              <View style={styles.row}>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={13} color="#4338ca" />
                  <Text style={styles.timeText}>{item.showTime}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(item.showDate)}</Text>
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
  list: { paddingBottom: 40, gap: 10 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 15 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 10, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  poster: { width: 56, height: 80, borderRadius: 10, backgroundColor: '#e5e7eb' },
  info: { flex: 1 },
  movieTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  theaterName: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 6 },
  timeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  timeText: { fontSize: 12, fontWeight: '700', color: '#4338ca' },
  dateText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  price: { fontSize: 15, fontWeight: '800', color: '#312e81', marginTop: 4 },
});
