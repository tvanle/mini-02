import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Movie } from '../types';
import { movieService } from '../services/movie.service';

type Props = {
  navigation: { navigate: (screen: string, params?: object) => void };
};

export function HomeScreen({ navigation }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const [moviesRes, genresRes] = await Promise.all([movieService.getAll(), movieService.getGenres()]);
      if (moviesRes.success && moviesRes.data) setMovies(moviesRes.data);
      if (genresRes.success && genresRes.data) setGenres(genresRes.data);
    })();
  }, []);

  const nowShowing = useMemo(() => movies.slice(0, 4), [movies]);
  const topRated = useMemo(() => [...movies].sort((a, b) => b.rating - a.rating).slice(0, 6), [movies]);

  const genreIcon: Record<string, string> = {
    Action: 'flash',
    Animation: 'color-palette',
    Thriller: 'skull',
    'Sci-Fi': 'planet',
    Horror: 'moon',
    Drama: 'heart',
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>CineTicket</Text>
          <Pressable onPress={() => navigation.navigate('MyTickets')}>
            <Ionicons name="ticket-outline" size={26} color="#4338ca" />
          </Pressable>
        </View>

        {/* Genre chips */}
        <FlatList
          horizontal
          data={genres}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
          renderItem={({ item }) => (
            <Pressable style={styles.genreChip} onPress={() => navigation.navigate('Movies')}>
              <View style={styles.genreIconWrap}>
                <Ionicons name={(genreIcon[item] || 'film') as any} size={18} color="#4338ca" />
              </View>
              <Text style={styles.genreName}>{item}</Text>
            </Pressable>
          )}
        />

        {/* Promo banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>Phim hay tuần này</Text>
          <Text style={styles.promoSub}>Đặt vé ngay - Nhiều suất chiếu mỗi ngày</Text>
        </View>

        {/* Now Showing */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Đang Chiếu</Text>
          <Pressable onPress={() => navigation.navigate('Movies')}>
            <Text style={styles.link}>Xem tất cả</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {nowShowing.map((movie) => (
            <Pressable key={movie.id} style={styles.movieCard} onPress={() => navigation.navigate('MovieDetail', { movieId: movie.id })}>
              <Image
                source={{ uri: movie.poster || 'https://picsum.photos/seed/movie-fallback/400/600' }}
                style={styles.poster}
                resizeMode="cover"
              />
              <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
              <View style={styles.movieMeta}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.rating}>{movie.rating}</Text>
                <Text style={styles.duration}>{movie.duration} phút</Text>
              </View>
              <View style={styles.genreTag}>
                <Text style={styles.genreTagText}>{movie.genre}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Top Rated */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Đánh giá cao</Text>
          <Pressable onPress={() => navigation.navigate('Movies')}>
            <Text style={styles.link}>Xem tất cả</Text>
          </Pressable>
        </View>
        <FlatList
          horizontal
          data={topRated}
          keyExtractor={(item) => `top-${item.id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sliderList}
          renderItem={({ item }) => (
            <Pressable style={styles.sliderCard} onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}>
              <Image
                source={{ uri: item.poster || 'https://picsum.photos/seed/top-fallback/400/600' }}
                style={styles.sliderPoster}
                resizeMode="cover"
              />
              <Text style={styles.sliderTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.movieMeta}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            </Pressable>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  brand: { fontSize: 24, fontWeight: '800', color: '#312e81' },
  genreList: { gap: 10, paddingBottom: 12 },
  genreChip: { alignItems: 'center', width: 72 },
  genreIconWrap: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#eef2ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  genreName: { fontSize: 11, color: '#374151', fontWeight: '600' },
  promoBanner: {
    backgroundColor: '#4338ca', borderRadius: 18, padding: 20, marginBottom: 18,
  },
  promoTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  promoSub: { color: '#c7d2fe', marginTop: 6, fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  link: { color: '#4338ca', fontWeight: '600', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginBottom: 18 },
  movieCard: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  poster: { height: 160, borderRadius: 10, backgroundColor: '#e5e7eb', marginBottom: 8 },
  movieTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  movieMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 12, fontWeight: '700', color: '#f59e0b' },
  duration: { fontSize: 11, color: '#6b7280', marginLeft: 6 },
  genreTag: { marginTop: 6, backgroundColor: '#eef2ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  genreTagText: { fontSize: 10, fontWeight: '700', color: '#4338ca' },
  sliderList: { gap: 10, paddingBottom: 8 },
  sliderCard: { width: 150, backgroundColor: '#fff', borderRadius: 14, padding: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sliderPoster: { height: 180, borderRadius: 10, backgroundColor: '#e5e7eb', marginBottom: 6 },
  sliderTitle: { fontSize: 13, fontWeight: '700', color: '#111827', minHeight: 34 },
});
