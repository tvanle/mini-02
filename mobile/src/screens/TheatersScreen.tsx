import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Theater } from '../types';
import { theaterService } from '../services/theater.service';

type Props = {
  navigation: { navigate: (screen: string, params?: object) => void };
};

export function TheatersScreen({ navigation }: Props) {
  const [theaters, setTheaters] = useState<Theater[]>([]);

  useEffect(() => {
    (async () => {
      const res = await theaterService.getAll();
      if (res.success && res.data) setTheaters(res.data);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Rạp Chiếu</Text>
      <FlatList
        data={theaters}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ShowtimeList', { theaterId: item.id })}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="film" size={28} color="#4338ca" />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.address}>{item.address}</Text>
              </View>
              <View style={styles.seatRow}>
                <Ionicons name="people-outline" size={14} color="#6b7280" />
                <Text style={styles.seats}>{item.totalSeats} ghế</Text>
              </View>
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
  list: { paddingBottom: 100, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#eef2ff',
    justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  address: { fontSize: 13, color: '#6b7280', flex: 1 },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  seats: { fontSize: 12, color: '#6b7280' },
});
