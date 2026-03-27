import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Category, Product } from '../types';
import { categoryService } from '../services/category.service';
import { productService } from '../services/product.service';

type Props = {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
};

export function HomeScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const [catRes, productRes] = await Promise.all([categoryService.getAll(), productService.getAll()]);
      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (productRes.success && productRes.data) setProducts(productRes.data);
    })();
  }, []);
  const featured = useMemo(() => products.slice(0, 4), [products]);
  const trending = useMemo(() => products.slice(2, 10), [products]);
  const newArrival = useMemo(() => products.slice(5, 13), [products]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.brand}>The Digital Concierge</Text>
        <Pressable onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartIcon}>🛒</Text>
        </Pressable>
      </View>

      <TextInput placeholder="Search for products..." style={styles.search} />

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable
            style={styles.categoryItem}
            onPress={() => navigation.navigate('ProductList', { categoryId: item.id, categoryName: item.name })}
          >
            <View style={styles.categoryIconWrap}>
              <Text style={styles.categoryIcon}>📦</Text>
            </View>
            <Text style={styles.categoryName}>{item.name}</Text>
          </Pressable>
        )}
      />

      <View style={styles.promoRow}>
        <View style={[styles.promoCard, styles.promoBig]}>
          <Text style={styles.promoTitle}>Summer Essentials</Text>
          <Text style={styles.promoSub}>Up to 40% Off</Text>
        </View>
        <View style={styles.promoRight}>
          <View style={[styles.promoCard, styles.promoSmallTop]}>
            <Text style={styles.promoSmallTitle}>New Drop</Text>
            <Text style={styles.promoSmallText}>Active Wear</Text>
          </View>
          <View style={[styles.promoCard, styles.promoSmallBottom]}>
            <Text style={styles.promoSmallTitle}>Flash Sale</Text>
            <Text style={styles.promoSmallText}>Limited Time</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <Pressable onPress={() => navigation.navigate('ProductList')}>
          <Text style={styles.link}>View All</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {featured.map((item) => (
          <Pressable key={item.id} style={styles.productCard} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
            <Image
              source={{ uri: item.image || 'https://picsum.photos/seed/home-fallback/500/500' }}
              style={styles.thumb}
              resizeMode="cover"
            />
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.price}>${(item.price / 23000).toFixed(2)}</Text>
            <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
              <Text style={styles.primaryBtnText}>Add to Cart</Text>
            </Pressable>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending</Text>
        <Pressable onPress={() => navigation.navigate('ProductList')}>
          <Text style={styles.link}>View All</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={trending}
        keyExtractor={(item) => `tr-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sliderList}
        renderItem={({ item }) => (
          <Pressable style={styles.sliderCard} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
            <Image
              source={{ uri: item.image || 'https://picsum.photos/seed/slider-fallback/500/500' }}
              style={styles.sliderThumb}
              resizeMode="cover"
            />
            <Text style={styles.sliderName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.sliderPrice}>${(item.price / 23000).toFixed(2)}</Text>
          </Pressable>
        )}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>New Arrivals</Text>
        <Pressable onPress={() => navigation.navigate('ProductList')}>
          <Text style={styles.link}>View All</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={newArrival}
        keyExtractor={(item) => `new-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sliderList}
        renderItem={({ item }) => (
          <Pressable style={styles.sliderCard} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
            <Image
              source={{ uri: item.image || 'https://picsum.photos/seed/slider2-fallback/500/500' }}
              style={styles.sliderThumb}
              resizeMode="cover"
            />
            <Text style={styles.sliderName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.sliderPrice}>${(item.price / 23000).toFixed(2)}</Text>
          </Pressable>
        )}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  brand: { fontSize: 22, fontWeight: '700', color: '#312e81' },
  cartIcon: { fontSize: 24 },
  search: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  categoryList: { gap: 12, paddingBottom: 10 },
  categoryItem: { alignItems: 'center', width: 80 },
  categoryIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIcon: { fontSize: 20 },
  categoryName: { fontSize: 12, textAlign: 'center' },
  promoRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  promoCard: { borderRadius: 18, padding: 14 },
  promoBig: { flex: 1, backgroundColor: '#4338ca', minHeight: 170 },
  promoRight: { width: 145, gap: 10 },
  promoSmallTop: { flex: 1, backgroundColor: '#f5d7b8' },
  promoSmallBottom: { flex: 1, backgroundColor: '#65f085' },
  promoTitle: { color: '#fff', fontSize: 25, fontWeight: '700' },
  promoSub: { color: '#ddd6fe', marginTop: 8, fontSize: 14 },
  promoSmallTitle: { fontSize: 16, fontWeight: '700', textTransform: 'uppercase' },
  promoSmallText: { marginTop: 6, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  link: { color: '#4338ca', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  productCard: { width: '48.5%', backgroundColor: '#fff', borderRadius: 14, padding: 10 },
  thumb: { height: 98, borderRadius: 10, backgroundColor: '#f1f5f9', marginBottom: 8 },
  productName: { fontSize: 14, color: '#1f2937' },
  price: { marginTop: 4, fontSize: 22, fontWeight: '700', color: '#111827' },
  primaryBtn: { marginTop: 8, backgroundColor: '#4338ca', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  sliderList: { gap: 10, paddingBottom: 8 },
  sliderCard: { width: 180, backgroundColor: '#fff', borderRadius: 14, padding: 10 },
  sliderThumb: { height: 96, borderRadius: 10, backgroundColor: '#eef2ff', marginBottom: 8 },
  sliderName: { fontSize: 14, fontWeight: '700', color: '#111827', minHeight: 34 },
  sliderPrice: { fontSize: 20, fontWeight: '800', color: '#312e81', marginTop: 4 },
});
