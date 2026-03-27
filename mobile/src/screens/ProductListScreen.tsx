import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Product, RootStackParamList } from '../types';
import { productService } from '../services/product.service';
import type { ProductSortBy } from '../services/product.service';
import { orderService } from '../services/order.service';
import { getCurrentUserId } from '../utils/session';
import { getLikedProductIds } from '../utils/likes';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

export function ProductListScreen({ navigation, route }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<ProductSortBy>('newest');
  const [likedOnly, setLikedOnly] = useState(false);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const categoryId = route.params?.categoryId;

  useEffect(() => {
    (async () => {
      const res = await productService.getAll(categoryId, sortBy);
      if (res.success && res.data) setProducts(res.data);
    })();
  }, [categoryId, sortBy]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const ids = await getLikedProductIds();
        setLikedIds(ids);
      })();
    }, [])
  );

  const filteredProducts = products
    .filter((item) => item.name.toLowerCase().includes(keyword.trim().toLowerCase()))
    .filter((item) => (likedOnly ? likedIds.includes(item.id) : true));

  const addToCart = async (productId: number) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      navigation.navigate('Login');
      return;
    }
    const res = await orderService.addToCart(productId, 1);
    if (!res.success) {
      Alert.alert('Lỗi', res.error || 'Không thêm được vào giỏ hàng');
      return;
    }
    Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
      <TextInput
        style={styles.search}
        placeholder="Tìm sản phẩm theo tên..."
        value={keyword}
        onChangeText={setKeyword}
      />
      <FlatList
        style={styles.filterBar}
        horizontal
        data={[
          { key: 'newest', label: 'Mới nhất' },
          { key: 'sold_desc', label: 'Bán chạy' },
          { key: 'price_asc', label: 'Giá tăng' },
          { key: 'price_desc', label: 'Giá giảm' },
          { key: 'liked', label: 'Đã tim' },
        ]}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => {
          const active =
            item.key === 'liked' ? likedOnly : sortBy === (item.key as ProductSortBy);
          return (
            <Pressable
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => {
                if (item.key === 'liked') {
                  setLikedOnly((v) => !v);
                } else {
                  setSortBy(item.key as ProductSortBy);
                }
              }}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        numColumns={2}
        data={filteredProducts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
            <Image
              source={{ uri: item.image || 'https://picsum.photos/seed/explore-fallback/500/500' }}
              style={styles.thumb}
              resizeMode="cover"
            />
            <View style={styles.topRow}>
              <Text style={styles.tag}>PREMIUM TECH</Text>
              <Text style={styles.heart}>{likedIds.includes(item.id) ? '♥' : '♡'}</Text>
            </View>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.price}>${(item.price / 23000).toFixed(2)}</Text>
            <Text style={styles.sold}>Đã bán: {item.soldCount ?? 0}</Text>
            <Pressable style={styles.addBtn} onPress={() => addToCart(item.id)}>
              <Text style={styles.addBtnText}>Add to Cart</Text>
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <View>
            <Text>Không có sản phẩm</Text>
          </View>
        }
      />
      {likedOnly && filteredProducts.length === 0 ? (
        <View style={styles.emptyLiked}>
          <Text style={styles.emptyLikedText}>Bạn chưa tim sản phẩm nào</Text>
        </View>
      ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  wrapper: { flex: 1, paddingTop: 8 },
  search: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  filterBar: { maxHeight: 56 },
  filterList: { paddingHorizontal: 12, paddingBottom: 8, gap: 8, alignItems: 'center' },
  filterChip: {
    backgroundColor: '#e5e7eb',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 42,
    minWidth: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: '#4338ca' },
  filterText: { fontWeight: '600', color: '#374151', fontSize: 14 },
  filterTextActive: { color: '#fff' },
  content: { padding: 10, paddingBottom: 110 },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  thumb: { height: 118, borderRadius: 12, backgroundColor: '#f1f5f9', marginBottom: 8 },
  tag: { color: '#6b7280', fontSize: 10, fontWeight: '600' },
  heart: { fontSize: 16, color: '#e11d48' },
  name: { fontSize: 16, fontWeight: '700', marginTop: 3, minHeight: 40, color: '#111827' },
  price: { marginTop: 6, color: '#111827', fontWeight: '700', fontSize: 20 },
  sold: { marginTop: 2, color: '#6b7280', fontSize: 12 },
  addBtn: { marginTop: 8, backgroundColor: '#4338ca', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  emptyLiked: { paddingHorizontal: 16, paddingVertical: 10 },
  emptyLikedText: { color: '#6b7280', fontStyle: 'italic' },
});
