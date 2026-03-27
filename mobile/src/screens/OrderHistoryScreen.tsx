import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Order, RootStackParamList } from '../types';
import { orderService } from '../services/order.service';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderHistory'>;

export function OrderHistoryScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const loadOrders = async () => {
    const res = await orderService.getOrderHistory();
    if (res.success && res.data) setOrders(res.data);
    else setOrders([]);
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadOrders);
    return unsub;
  }, [navigation]);

  const visibleOrders = orders
    .filter((item) => {
      const code = `ORD-${String(item.id).padStart(6, '0')}`.toLowerCase();
      const date = new Date(item.createdAt).toLocaleDateString().toLowerCase();
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return code.includes(q) || date.includes(q);
    })
    .sort((a, b) =>
      sortNewestFirst
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const lifetimeSpend = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
        <Text style={styles.header}>Order History</Text>
        <Pressable style={styles.iconBtn}>
          <Text style={styles.cartIcon}>🛒</Text>
        </Pressable>
      </View>

      <View style={styles.spentCard}>
        <Text style={styles.spentLabel}>LIFETIME SPEND</Text>
        <Text style={styles.spentValue}>
          ${((lifetimeSpend / 23000)).toFixed(2)}
        </Text>
        <View style={styles.chartGhost}>
          <MaterialCommunityIcons name="chart-line-variant" size={44} color="#e5e7eb" />
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable style={styles.filterBtn} onPress={() => setSortNewestFirst((v) => !v)}>
          <Ionicons name={sortNewestFirst ? 'funnel-outline' : 'swap-vertical-outline'} size={18} color="#111827" />
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        data={visibleOrders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <Text style={styles.id}>Order #ORD-{String(item.id).padStart(6, '0')}</Text>
              <Text style={styles.paid}>PAID</Text>
            </View>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
            <View style={styles.line} />
            <View style={styles.bottomRow}>
              <View style={styles.itemPreview}>
                {item.items.slice(0, 2).map((it, idx) => (
                  <Image
                    key={it.id}
                    source={{ uri: it.productImage || 'https://picsum.photos/seed/order-fallback/200/200' }}
                    style={[styles.previewImage, idx > 0 && styles.previewImageOverlap]}
                  />
                ))}
                {item.items.length > 2 ? (
                  <View style={styles.moreBubble}>
                    <Text style={styles.moreText}>+{item.items.length - 2}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.totalWrap}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.total}>${(item.totalAmount / 23000).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="archive-outline" size={54} color="#9ca3af" />
            <Text style={styles.emptyText}>Showing orders from the last 6 months</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingTop: 8 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  iconBtn: { width: 28, alignItems: 'center' },
  menuIcon: { fontSize: 20, color: '#4338ca' },
  cartIcon: { fontSize: 20, color: '#4338ca' },
  header: { fontSize: 32, fontWeight: '800', color: '#111827' },
  spentCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, position: 'relative', overflow: 'hidden' },
  spentLabel: { color: '#6b7280', letterSpacing: 1 },
  spentValue: { marginTop: 6, fontSize: 28, color: '#4338ca', fontWeight: '800' },
  chartGhost: { position: 'absolute', right: 10, top: 12 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  searchWrap: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 10 },
  filterBtn: {
    width: 46,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { gap: 10, paddingBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontSize: 18, fontWeight: '800' },
  paid: { color: '#15803d', backgroundColor: '#dcfce7', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, fontWeight: '700' },
  time: { color: '#6b7280', marginTop: 6, fontSize: 14 },
  line: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPreview: { flexDirection: 'row', alignItems: 'center' },
  previewImage: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e5e7eb' },
  previewImageOverlap: { marginLeft: -8 },
  moreBubble: {
    marginLeft: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: { fontSize: 10, fontWeight: '700', color: '#4b5563' },
  totalWrap: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 12, color: '#6b7280' },
  total: { fontSize: 24, fontWeight: '800' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, gap: 10 },
  emptyText: { color: '#9ca3af', fontStyle: 'italic' },
});
