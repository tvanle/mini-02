import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
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
        <ActivityIndicator size="large" color="#6366f1" />
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
      <TextInput
        placeholder="Tìm kiếm sản phẩm..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
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
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  price: { marginTop: 4, color: '#16a34a', fontWeight: '700' },
  stock: { marginTop: 4, color: '#64748b' },
  addButton: { marginTop: 10, backgroundColor: '#6366f1', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '600' },
  errorText: { color: '#ef4444', fontSize: 16 },
});
