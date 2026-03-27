import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Movie, Showtime } from '../types';
import { movieService } from '../services/movie.service';
import { showtimeService } from '../services/showtime.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

type Props = {
  navigation: { navigate: (screen: string, params?: object) => void };
};

export function HomeScreen({ navigation }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      const [moviesRes, genresRes, showtimesRes] = await Promise.all([
        movieService.getAll(),
        movieService.getGenres(),
        showtimeService.getAll(),
      ]);
      if (moviesRes.success && moviesRes.data) setMovies(moviesRes.data);
      if (genresRes.success && genresRes.data) setGenres(genresRes.data);
      if (showtimesRes.success && showtimesRes.data) setShowtimes(showtimesRes.data);
    })();
  }, []);

  // Auto-scroll banner
  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      const nextIndex = (activeBanner + 1) % Math.min(movies.length, 5);
      bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveBanner(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBanner, movies.length]);

  // Featured movies (top rated)
  const featuredMovies = useMemo(() =>
    [...movies].sort((a, b) => b.rating - a.rating).slice(0, 5),
    [movies]
  );

  // Movies with deals (cheapest showtimes)
  const dealsMovies = useMemo(() => {
    const moviePrices = new Map<number, { movie: Movie; minPrice: number; originalPrice: number }>();
    showtimes.forEach((st) => {
      const movie = movies.find((m) => m.id === st.movieId);
      if (!movie) return;
      const existing = moviePrices.get(st.movieId);
      if (!existing || st.price < existing.minPrice) {
        moviePrices.set(st.movieId, {
          movie,
          minPrice: st.price,
          originalPrice: st.price < 100000 ? Math.round(st.price * 1.3) : st.price,
        });
      }
    });
    return Array.from(moviePrices.values())
      .filter((item) => item.minPrice < 100000)
      .sort((a, b) => a.minPrice - b.minPrice)
      .slice(0, 6);
  }, [movies, showtimes]);

  // Now showing (all movies)
  const nowShowing = useMemo(() => movies.slice(0, 6), [movies]);

  // Top rated
  const topRated = useMemo(() =>
    [...movies].sort((a, b) => b.rating - a.rating).slice(0, 8),
    [movies]
  );

  const genreIcon: Record<string, string> = {
    Action: 'flash',
    Animation: 'color-palette',
    Thriller: 'skull',
    'Sci-Fi': 'planet',
    Horror: 'moon',
    Drama: 'heart',
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào!</Text>
            <Text style={styles.brand}>CineTicket</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerBtn} onPress={() => navigation.navigate('Movies')}>
              <Ionicons name="search" size={22} color="#4338ca" />
            </Pressable>
            <Pressable style={styles.headerBtn} onPress={() => navigation.navigate('MyTickets')}>
              <Ionicons name="ticket-outline" size={22} color="#4338ca" />
            </Pressable>
          </View>
        </View>

        {/* Featured Banner */}
        {featuredMovies.length > 0 && (
          <View style={styles.bannerSection}>
            <FlatList
              ref={bannerRef}
              horizontal
              data={featuredMovies}
              keyExtractor={(item) => `banner-${item.id}`}
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={BANNER_WIDTH + 12}
              decelerationRate="fast"
              contentContainerStyle={styles.bannerList}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12));
                setActiveBanner(index);
              }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.bannerCard}
                  onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
                >
                  <Image
                    source={{ uri: item.poster || 'https://picsum.photos/seed/banner/800/400' }}
                    style={styles.bannerImage}
                  />
                  <View style={styles.bannerOverlay} />
                  <View style={styles.bannerContent}>
                    <View style={styles.featuredBadge}>
                      <Ionicons name="star" size={12} color="#fff" />
                      <Text style={styles.featuredText}>Nổi bật</Text>
                    </View>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <View style={styles.bannerMeta}>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={14} color="#f59e0b" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                      <Text style={styles.bannerGenre}>{item.genre}</Text>
                      <Text style={styles.bannerDuration}>{item.duration} phút</Text>
                    </View>
                  </View>
                </Pressable>
              )}
            />
            {/* Dots indicator */}
            <View style={styles.dotsContainer}>
              {featuredMovies.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, activeBanner === idx && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Genre chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
          style={styles.genreSection}
        >
          {genres.map((item) => (
            <Pressable key={item} style={styles.genreChip} onPress={() => navigation.navigate('Movies')}>
              <View style={styles.genreIconWrap}>
                <Ionicons name={(genreIcon[item] || 'film') as any} size={22} color="#4338ca" />
              </View>
              <Text style={styles.genreName}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Hot Deals Section */}
        {dealsMovies.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWrap}>
                <View style={styles.fireIcon}>
                  <Ionicons name="flame" size={18} color="#ef4444" />
                </View>
                <Text style={styles.sectionTitle}>Ưu đãi hot</Text>
              </View>
              <Pressable onPress={() => navigation.navigate('Showtimes')}>
                <Text style={styles.link}>Xem tất cả</Text>
              </Pressable>
            </View>
            <FlatList
              horizontal
              data={dealsMovies}
              keyExtractor={(item) => `deal-${item.movie.id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dealsList}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.dealCard}
                  onPress={() => navigation.navigate('MovieDetail', { movieId: item.movie.id })}
                >
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{Math.round((1 - item.minPrice / item.originalPrice) * 100)}%</Text>
                  </View>
                  <Image
                    source={{ uri: item.movie.poster || 'https://picsum.photos/seed/deal/400/600' }}
                    style={styles.dealPoster}
                  />
                  <Text style={styles.dealTitle} numberOfLines={1}>{item.movie.title}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
                    <Text style={styles.dealPrice}>{formatPrice(item.minPrice)}</Text>
                  </View>
                </Pressable>
              )}
            />
          </>
        )}

        {/* Now Showing */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <View style={[styles.fireIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="play-circle" size={18} color="#16a34a" />
            </View>
            <Text style={styles.sectionTitle}>Đang chiếu</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Movies')}>
            <Text style={styles.link}>Xem tất cả</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {nowShowing.map((movie) => (
            <Pressable
              key={movie.id}
              style={styles.movieCard}
              onPress={() => navigation.navigate('MovieDetail', { movieId: movie.id })}
            >
              <Image
                source={{ uri: movie.poster || 'https://picsum.photos/seed/movie/400/600' }}
                style={styles.poster}
              />
              <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
              <View style={styles.movieMeta}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.rating}>{movie.rating}</Text>
                <Text style={styles.duration}>{movie.duration}p</Text>
              </View>
              <View style={styles.genreTag}>
                <Text style={styles.genreTagText}>{movie.genre}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Top Rated */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <View style={[styles.fireIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="trophy" size={18} color="#d97706" />
            </View>
            <Text style={styles.sectionTitle}>Đánh giá cao</Text>
          </View>
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
          renderItem={({ item, index }) => (
            <Pressable
              style={styles.topRatedCard}
              onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <Image
                source={{ uri: item.poster || 'https://picsum.photos/seed/top/400/600' }}
                style={styles.topRatedPoster}
              />
              <Text style={styles.topRatedTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.movieMeta}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.topRatedRating}>{item.rating}</Text>
              </View>
            </Pressable>
          )}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  greeting: { fontSize: 14, color: '#6b7280' },
  brand: { fontSize: 26, fontWeight: '800', color: '#312e81' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerSection: { marginBottom: 16 },
  bannerList: { paddingHorizontal: 16 },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  bannerMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  bannerGenre: { color: '#e5e7eb', fontSize: 13 },
  bannerDuration: { color: '#e5e7eb', fontSize: 13 },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: { backgroundColor: '#4338ca', width: 24 },
  genreSection: { flexGrow: 0, marginBottom: 12 },
  genreList: { gap: 14, paddingHorizontal: 16, paddingVertical: 8 },
  genreChip: { alignItems: 'center', width: 80 },
  genreIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#4338ca',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  genreName: { fontSize: 12, color: '#374151', fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fireIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  link: { color: '#4338ca', fontWeight: '600', fontSize: 13 },
  dealsList: { paddingHorizontal: 16, gap: 12 },
  dealCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  discountText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  dealPoster: {
    height: 160,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  dealTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  originalPrice: {
    fontSize: 11,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  dealPrice: { fontSize: 14, fontWeight: '800', color: '#ef4444' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    rowGap: 12,
  },
  movieCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  poster: {
    height: 170,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  movieTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  movieMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 12, fontWeight: '700', color: '#f59e0b' },
  duration: { fontSize: 11, color: '#6b7280', marginLeft: 6 },
  genreTag: {
    marginTop: 8,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  genreTagText: { fontSize: 10, fontWeight: '700', color: '#4338ca' },
  sliderList: { paddingHorizontal: 16, gap: 12 },
  topRatedCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  rankBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#4338ca',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  rankText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  topRatedPoster: {
    height: 170,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  topRatedTitle: { fontSize: 13, fontWeight: '700', color: '#111827', minHeight: 36 },
  topRatedRating: { fontSize: 14, fontWeight: '800', color: '#f59e0b' },
});
