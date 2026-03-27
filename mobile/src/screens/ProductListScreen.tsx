import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Product, RootStackParamList } from '../types';
import { useProductStore } from '../stores/product.store';
import { useCartStore } from '../stores/cart.store';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

export function ProductListScreen({ route, navigation }: Props) {
  const { products, loading, error, fetchProducts } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const [search, setSearch] = useState('');

  const categoryId = route.params?.categoryId;
  const title = route.params?.title ?? 'Sản phẩm';

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  useEffect(() => {
    fetchProducts({ categoryId, search: search.trim() || undefined });
  }, [categoryId, search, fetchProducts]);

  const onAdd = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể thêm vào giỏ');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.banner}>
        <Text style={styles.bannerTitle}>{title}</Text>
        <Text style={styles.bannerText}>Khám phá sản phẩm theo phong cách card-based hiện đại.</Text>
      </LinearGradient>

      <TextInput
        placeholder="Tìm kiếm sản phẩm..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        placeholderTextColor="#94a3b8"
      />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: Product }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price.toLocaleString('vi-VN')} đ</Text>
            <Text style={styles.stock}>Tồn kho: {item.stock}</Text>

            <TouchableOpacity style={styles.addButton} onPress={() => onAdd(item.id)}>
              <Text style={styles.addButtonText}>Thêm vào giỏ</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#f4f6ff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#5b21b6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7,
  },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  bannerText: { color: '#ede9fe', lineHeight: 20 },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 12,
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  price: { marginTop: 4, color: '#16a34a', fontWeight: '700' },
  stock: { marginTop: 4, color: '#64748b' },
  addButton: { marginTop: 10, backgroundColor: '#6d28d9', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700' },
  errorText: { color: '#ef4444', fontSize: 16 },
});
