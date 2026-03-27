import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Movie, RootStackParamList, Showtime } from '../types';
import { movieService } from '../services/movie.service';
import { showtimeService } from '../services/showtime.service';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

export function MovieDetailScreen({ route, navigation }: Props) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  useEffect(() => {
    (async () => {
      const [movieRes, stRes] = await Promise.all([
        movieService.getById(movieId),
        showtimeService.getAll(movieId),
      ]);
      if (movieRes.success && movieRes.data) setMovie(movieRes.data);
      if (stRes.success && stRes.data) setShowtimes(stRes.data);
    })();
  }, [movieId]);

  if (!movie) return null;

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: movie.poster || 'https://picsum.photos/seed/detail/400/600' }}
          style={styles.poster}
          resizeMode="cover"
        />

        <View style={styles.body}>
          <Text style={styles.title}>{movie.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.metaValue}>{movie.rating}/10</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.metaValue}>{movie.duration} phút</Text>
            </View>
            <View style={styles.genreTag}>
              <Text style={styles.genreText}>{movie.genre}</Text>
            </View>
          </View>

          <Text style={styles.releaseDate}>Khởi chiếu: {movie.releaseDate}</Text>

          <Text style={styles.sectionLabel}>Nội dung</Text>
          <Text style={styles.description}>{movie.description}</Text>

          <Text style={styles.sectionLabel}>Lịch chiếu</Text>
          {showtimes.length === 0 ? (
            <Text style={styles.empty}>Chưa có lịch chiếu</Text>
          ) : (
            showtimes.map((st) => (
              <Pressable
                key={st.id}
                style={styles.showtimeCard}
                onPress={() => navigation.navigate('SeatSelection', { showtimeId: st.id })}
              >
                <View style={styles.stInfo}>
                  <Text style={styles.stTheater}>{st.theaterName}</Text>
                  <View style={styles.stRow}>
                    <View style={styles.timeBadge}>
                      <Ionicons name="time-outline" size={13} color="#4338ca" />
                      <Text style={styles.timeText}>{st.showTime}</Text>
                    </View>
                    <Text style={styles.stDate}>{formatDate(st.showDate)}</Text>
                  </View>
                </View>
                <View style={styles.stRight}>
                  <Text style={styles.stPrice}>{st.price.toLocaleString('vi-VN')}đ</Text>
                  <Ionicons name="chevron-forward" size={18} color="#c7d2fe" />
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { paddingBottom: 40 },
  poster: { width: '100%', height: 320, backgroundColor: '#e5e7eb' },
  body: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaValue: { fontSize: 14, fontWeight: '600', color: '#374151' },
  genreTag: { backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  genreText: { fontSize: 12, fontWeight: '700', color: '#4338ca' },
  releaseDate: { marginTop: 8, fontSize: 13, color: '#6b7280' },
  sectionLabel: { marginTop: 20, fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 22, color: '#4b5563' },
  empty: { fontSize: 14, color: '#9ca3af', fontStyle: 'italic' },
  showtimeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  stInfo: { flex: 1 },
  stTheater: { fontSize: 14, fontWeight: '700', color: '#111827' },
  stRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  timeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  timeText: { fontSize: 13, fontWeight: '700', color: '#4338ca' },
  stDate: { fontSize: 13, color: '#6b7280' },
  stRight: { alignItems: 'flex-end', gap: 4 },
  stPrice: { fontSize: 16, fontWeight: '800', color: '#312e81' },
});
