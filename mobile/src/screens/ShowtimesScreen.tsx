import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { Showtime, Theater } from '../types';
import { showtimeService } from '../services/showtime.service';
import { theaterService } from '../services/theater.service';

type TimeSlot = 'all' | 'morning' | 'afternoon' | 'evening';

type Props = {
  navigation: { navigate: (screen: string, params?: object) => void };
};

export function ShowtimesScreen({ navigation }: Props) {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTheater, setSelectedTheater] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const loadData = async () => {
    const [showtimesRes, theatersRes] = await Promise.all([
      showtimeService.getAll(),
      theaterService.getAll(),
    ]);
    if (showtimesRes.success && showtimesRes.data) setShowtimes(showtimesRes.data);
    if (theatersRes.success && theatersRes.data) setTheaters(theatersRes.data);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const dates = [...new Set(showtimes.map((s) => s.showDate))].sort();

  const getTimeSlot = (time: string): TimeSlot => {
    const hour = parseInt(time.split(':')[0], 10);
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const filtered = showtimes.filter((s) => {
    if (selectedDate && s.showDate !== selectedDate) return false;
    if (selectedTheater && s.theaterId !== selectedTheater) return false;
    if (selectedTimeSlot !== 'all' && getTimeSlot(s.showTime) !== selectedTimeSlot) return false;
    return true;
  });

  const activeFiltersCount = [selectedTheater, selectedTimeSlot !== 'all'].filter(Boolean).length;

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

  const timeSlots: { key: TimeSlot; label: string; icon: string; time: string }[] = [
    { key: 'all', label: 'Tất cả', icon: 'time', time: '' },
    { key: 'morning', label: 'Sáng', icon: 'sunny', time: '6:00 - 12:00' },
    { key: 'afternoon', label: 'Chiều', icon: 'partly-sunny', time: '12:00 - 18:00' },
    { key: 'evening', label: 'Tối', icon: 'moon', time: '18:00 - 24:00' },
  ];

  const clearFilters = () => {
    setSelectedTheater(null);
    setSelectedTimeSlot('all');
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lịch Chiếu</Text>
        <Pressable
          style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options" size={20} color={activeFiltersCount > 0 ? '#fff' : '#4338ca'} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Date Filter */}
      <View style={styles.dateContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
        >
          {['Tất cả', ...dates].map((item) => {
            const isAll = item === 'Tất cả';
            const isActive = isAll ? !selectedDate : selectedDate === item;
            return (
              <Pressable
                key={item}
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
          })}
        </ScrollView>
      </View>

      {/* Quick Time Slot Filter */}
      <View style={styles.timeSlotContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeSlotList}
        >
          {timeSlots.map((slot) => (
            <Pressable
              key={slot.key}
              style={[styles.timeSlotChip, selectedTimeSlot === slot.key && styles.timeSlotChipActive]}
              onPress={() => setSelectedTimeSlot(slot.key)}
            >
              <Ionicons
                name={slot.icon as any}
                size={18}
                color={selectedTimeSlot === slot.key ? '#fff' : '#6b7280'}
              />
              <Text style={[styles.timeSlotText, selectedTimeSlot === slot.key && styles.timeSlotTextActive]}>
                {slot.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Active Filters Display */}
      {(selectedTheater || selectedTimeSlot !== 'all') && (
        <View style={styles.activeFilters}>
          {selectedTheater && (
            <View style={styles.activeFilterTag}>
              <Ionicons name="business" size={14} color="#4338ca" />
              <Text style={styles.activeFilterText}>
                {theaters.find((t) => t.id === selectedTheater)?.name}
              </Text>
              <Pressable onPress={() => setSelectedTheater(null)}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </Pressable>
            </View>
          )}
          <Pressable style={styles.clearAllBtn} onPress={clearFilters}>
            <Text style={styles.clearAllText}>Xoá bộ lọc</Text>
          </Pressable>
        </View>
      )}

      {/* Results count */}
      <Text style={styles.resultCount}>{filtered.length} suất chiếu</Text>

      {/* Showtimes List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Không tìm thấy suất chiếu</Text>
            <Text style={styles.emptySubtitle}>Thử thay đổi bộ lọc để xem thêm</Text>
          </View>
        }
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
              <View style={styles.theaterRow}>
                <Ionicons name="business-outline" size={12} color="#6b7280" />
                <Text style={styles.theaterName}>{item.theaterName}</Text>
              </View>
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
            <View style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>Đặt vé</Text>
            </View>
          </Pressable>
        )}
      />

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            {/* Theater Filter */}
            <Text style={styles.filterSectionTitle}>Rạp chiếu phim</Text>
            <View style={styles.theaterList}>
              <Pressable
                style={[styles.theaterItem, !selectedTheater && styles.theaterItemActive]}
                onPress={() => setSelectedTheater(null)}
              >
                <Ionicons name="apps" size={20} color={!selectedTheater ? '#4338ca' : '#6b7280'} />
                <Text style={[styles.theaterItemText, !selectedTheater && styles.theaterItemTextActive]}>
                  Tất cả rạp
                </Text>
                {!selectedTheater && <Ionicons name="checkmark-circle" size={20} color="#4338ca" />}
              </Pressable>
              {theaters.map((theater) => (
                <Pressable
                  key={theater.id}
                  style={[styles.theaterItem, selectedTheater === theater.id && styles.theaterItemActive]}
                  onPress={() => setSelectedTheater(theater.id)}
                >
                  <Ionicons
                    name="business"
                    size={20}
                    color={selectedTheater === theater.id ? '#4338ca' : '#6b7280'}
                  />
                  <View style={styles.theaterItemInfo}>
                    <Text style={[styles.theaterItemText, selectedTheater === theater.id && styles.theaterItemTextActive]}>
                      {theater.name}
                    </Text>
                    <Text style={styles.theaterItemAddress} numberOfLines={1}>{theater.address}</Text>
                  </View>
                  {selectedTheater === theater.id && <Ionicons name="checkmark-circle" size={20} color="#4338ca" />}
                </Pressable>
              ))}
            </View>

            {/* Time Slot Filter */}
            <Text style={styles.filterSectionTitle}>Khung giờ</Text>
            <View style={styles.timeSlotGrid}>
              {timeSlots.map((slot) => (
                <Pressable
                  key={slot.key}
                  style={[styles.timeSlotCard, selectedTimeSlot === slot.key && styles.timeSlotCardActive]}
                  onPress={() => setSelectedTimeSlot(slot.key)}
                >
                  <Ionicons
                    name={slot.icon as any}
                    size={24}
                    color={selectedTimeSlot === slot.key ? '#4338ca' : '#6b7280'}
                  />
                  <Text style={[styles.timeSlotCardLabel, selectedTimeSlot === slot.key && styles.timeSlotCardLabelActive]}>
                    {slot.label}
                  </Text>
                  {slot.time && <Text style={styles.timeSlotCardTime}>{slot.time}</Text>}
                </Pressable>
              ))}
            </View>

            {/* Apply Button */}
            <View style={styles.modalFooter}>
              <Pressable style={styles.clearBtn} onPress={clearFilters}>
                <Text style={styles.clearBtnText}>Xoá bộ lọc</Text>
              </Pressable>
              <Pressable style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
                <Text style={styles.applyBtnText}>Áp dụng</Text>
              </Pressable>
            </View>
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
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: '#4338ca' },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  dateContainer: {
    height: 72,
    marginBottom: 12,
  },
  dateList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    height: 72,
  },
  dateChip: {
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 75,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dateChipActive: { backgroundColor: '#4338ca', borderColor: '#4338ca' },
  dateDayName: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  dateDay: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 2 },
  dateDayActive: { color: '#fff' },
  timeSlotContainer: {
    height: 56,
    marginBottom: 12,
  },
  timeSlotList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  timeSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  timeSlotChipActive: { backgroundColor: '#4338ca', borderColor: '#4338ca' },
  timeSlotText: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
  timeSlotTextActive: { color: '#fff' },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeFilterText: { fontSize: 12, fontWeight: '600', color: '#4338ca' },
  clearAllBtn: { marginLeft: 'auto' },
  clearAllText: { fontSize: 13, fontWeight: '600', color: '#ef4444' },
  resultCount: {
    fontSize: 13,
    color: '#6b7280',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  poster: { width: 65, height: 90, borderRadius: 12, backgroundColor: '#e5e7eb' },
  info: { flex: 1 },
  movieTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  theaterRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  theaterName: { fontSize: 12, color: '#6b7280' },
  timeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: { fontSize: 13, fontWeight: '700', color: '#4338ca' },
  dateBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dateText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  price: { fontSize: 16, fontWeight: '800', color: '#312e81', marginTop: 6 },
  bookBtn: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  filterSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  theaterList: { gap: 8 },
  theaterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  theaterItemActive: { backgroundColor: '#eef2ff', borderColor: '#4338ca' },
  theaterItemInfo: { flex: 1 },
  theaterItemText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  theaterItemTextActive: { color: '#4338ca' },
  theaterItemAddress: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlotCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeSlotCardActive: { backgroundColor: '#eef2ff', borderColor: '#4338ca' },
  timeSlotCardLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 8 },
  timeSlotCardLabelActive: { color: '#4338ca' },
  timeSlotCardTime: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  clearBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4338ca',
    alignItems: 'center',
  },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
