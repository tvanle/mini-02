import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Movie } from '../types';
import { movieService } from '../services/movie.service';

type Props = {
  navigation: { navigate: (screen: string, params?: object) => void };
};

export function MoviesScreen({ navigation }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const [moviesRes, genresRes] = await Promise.all([movieService.getAll(), movieService.getGenres()]);
      if (moviesRes.success && moviesRes.data) setMovies(moviesRes.data);
      if (genresRes.success && genresRes.data) setGenres(genresRes.data);
    })();
  }, []);

  const filtered = movies.filter((m) => {
    const matchGenre = !selectedGenre || m.genre === selectedGenre;
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Phim</Text>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm phim..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        data={['Tất cả', ...genres]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        renderItem={({ item }) => {
          const isActive = item === 'Tất cả' ? !selectedGenre : selectedGenre === item;
          return (
            <Pressable
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setSelectedGenre(item === 'Tất cả' ? null : item)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{item}</Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}>
            <Image
              source={{ uri: item.poster || 'https://picsum.photos/seed/movie/400/600' }}
              style={styles.poster}
              resizeMode="cover"
            />
            <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.meta}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.duration}>{item.duration}p</Text>
            </View>
            <View style={styles.genreTag}>
              <Text style={styles.genreText}>{item.genre}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 12 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e5e7eb',
    borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  chipList: { gap: 8, paddingBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#4338ca', borderColor: '#4338ca' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  chipTextActive: { color: '#fff' },
  list: { paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  poster: { height: 180, borderRadius: 10, backgroundColor: '#e5e7eb', marginBottom: 8 },
  movieTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 12, fontWeight: '700', color: '#f59e0b' },
  dot: { color: '#9ca3af' },
  duration: { fontSize: 11, color: '#6b7280' },
  genreTag: { marginTop: 6, backgroundColor: '#eef2ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  genreText: { fontSize: 10, fontWeight: '700', color: '#4338ca' },
});
