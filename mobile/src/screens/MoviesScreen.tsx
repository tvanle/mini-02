import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Movie, Showtime, Theater } from '../types';
import { movieService } from '../services/movie.service';
import { theaterService } from '../services/theater.service';
import { showtimeService } from '../services/showtime.service';

type Props = {
  navigation: { navigate: (screen: string, params?: object) => void };
};

export function MoviesScreen({ navigation }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTheater, setSelectedTheater] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [showTheaterModal, setShowTheaterModal] = useState(false);

  useEffect(() => {
    (async () => {
      const [moviesRes, genresRes, theatersRes, showtimesRes] = await Promise.all([
        movieService.getAll(),
        movieService.getGenres(),
        theaterService.getAll(),
        showtimeService.getAll(),
      ]);
      if (moviesRes.success && moviesRes.data) setMovies(moviesRes.data);
      if (genresRes.success && genresRes.data) setGenres(genresRes.data);
      if (theatersRes.success && theatersRes.data) setTheaters(theatersRes.data);
      if (showtimesRes.success && showtimesRes.data) setShowtimes(showtimesRes.data);
    })();
  }, []);

  // Get movies that have showtimes at selected theater
  const moviesAtTheater = selectedTheater
    ? [...new Set(showtimes.filter((s) => s.theaterId === selectedTheater).map((s) => s.movieId))]
    : null;

  const filtered = movies.filter((m) => {
    const matchGenre = !selectedGenre || m.genre === selectedGenre;
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    const matchTheater = !moviesAtTheater || moviesAtTheater.includes(m.id);
    return matchGenre && matchSearch && matchTheater;
  });

  const selectedTheaterName = theaters.find((t) => t.id === selectedTheater)?.name;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Phim</Text>
        <Pressable
          style={[styles.theaterBtn, selectedTheater && styles.theaterBtnActive]}
          onPress={() => setShowTheaterModal(true)}
        >
          <Ionicons name="business" size={18} color={selectedTheater ? '#fff' : '#4338ca'} />
          <Text style={[styles.theaterBtnText, selectedTheater && styles.theaterBtnTextActive]}>
            {selectedTheater ? 'Rạp' : 'Chọn rạp'}
          </Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm phim..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </Pressable>
        )}
      </View>

      {/* Selected Theater Badge */}
      {selectedTheater && (
        <View style={styles.selectedTheaterWrap}>
          <View style={styles.selectedTheaterBadge}>
            <Ionicons name="business" size={14} color="#4338ca" />
            <Text style={styles.selectedTheaterText}>{selectedTheaterName}</Text>
            <Pressable onPress={() => setSelectedTheater(null)}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Genre Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        style={styles.chipScroll}
      >
        {['Tất cả', ...genres].map((item) => {
          const isActive = item === 'Tất cả' ? !selectedGenre : selectedGenre === item;
          return (
            <Pressable
              key={item}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setSelectedGenre(item === 'Tất cả' ? null : item)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultCount}>{filtered.length} phim</Text>

      {/* Movies List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="film-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Không tìm thấy phim</Text>
            <Text style={styles.emptySubtitle}>Thử thay đổi bộ lọc để xem thêm</Text>
          </View>
        }
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

      {/* Theater Modal */}
      <Modal visible={showTheaterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn rạp chiếu</Text>
              <Pressable onPress={() => setShowTheaterModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <Pressable
              style={[styles.theaterItem, !selectedTheater && styles.theaterItemActive]}
              onPress={() => {
                setSelectedTheater(null);
                setShowTheaterModal(false);
              }}
            >
              <View style={[styles.theaterIcon, !selectedTheater && styles.theaterIconActive]}>
                <Ionicons name="apps" size={20} color={!selectedTheater ? '#fff' : '#6b7280'} />
              </View>
              <View style={styles.theaterItemInfo}>
                <Text style={[styles.theaterItemName, !selectedTheater && styles.theaterItemNameActive]}>
                  Tất cả rạp
                </Text>
                <Text style={styles.theaterItemDesc}>Hiển thị tất cả phim</Text>
              </View>
              {!selectedTheater && <Ionicons name="checkmark-circle" size={22} color="#4338ca" />}
            </Pressable>

            {theaters.map((theater) => {
              const isActive = selectedTheater === theater.id;
              const movieCount = [...new Set(showtimes.filter((s) => s.theaterId === theater.id).map((s) => s.movieId))].length;
              return (
                <Pressable
                  key={theater.id}
                  style={[styles.theaterItem, isActive && styles.theaterItemActive]}
                  onPress={() => {
                    setSelectedTheater(theater.id);
                    setShowTheaterModal(false);
                  }}
                >
                  <View style={[styles.theaterIcon, isActive && styles.theaterIconActive]}>
                    <Ionicons name="business" size={20} color={isActive ? '#fff' : '#6b7280'} />
                  </View>
                  <View style={styles.theaterItemInfo}>
                    <Text style={[styles.theaterItemName, isActive && styles.theaterItemNameActive]}>
                      {theater.name}
                    </Text>
                    <Text style={styles.theaterItemDesc} numberOfLines={1}>
                      {theater.address} · {movieCount} phim
                    </Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={22} color="#4338ca" />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  theaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
  },
  theaterBtnActive: { backgroundColor: '#4338ca' },
  theaterBtnText: { fontSize: 13, fontWeight: '600', color: '#4338ca' },
  theaterBtnTextActive: { color: '#fff' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  selectedTheaterWrap: { paddingHorizontal: 16, marginBottom: 8 },
  selectedTheaterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  selectedTheaterText: { fontSize: 13, fontWeight: '600', color: '#4338ca' },
  chipScroll: { flexGrow: 0, marginBottom: 8 },
  chipList: { gap: 10, paddingHorizontal: 16, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chipActive: { backgroundColor: '#4338ca', borderColor: '#4338ca' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  chipTextActive: { color: '#fff' },
  resultCount: {
    fontSize: 13,
    color: '#6b7280',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  poster: { height: 180, borderRadius: 12, backgroundColor: '#e5e7eb', marginBottom: 8 },
  movieTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 12, fontWeight: '700', color: '#f59e0b' },
  dot: { color: '#9ca3af' },
  duration: { fontSize: 11, color: '#6b7280' },
  genreTag: {
    marginTop: 8,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  genreText: { fontSize: 10, fontWeight: '700', color: '#4338ca' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  theaterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f9fafb',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  theaterItemActive: { backgroundColor: '#eef2ff', borderColor: '#4338ca' },
  theaterIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  theaterIconActive: { backgroundColor: '#4338ca' },
  theaterItemInfo: { flex: 1 },
  theaterItemName: { fontSize: 15, fontWeight: '600', color: '#374151' },
  theaterItemNameActive: { color: '#4338ca' },
  theaterItemDesc: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
