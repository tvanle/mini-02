import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useProductStore } from '../stores/product.store';
import { useCartStore } from '../stores/cart.store';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route }: Props) {
  const { productDetail, loading, error, fetchProductById } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    fetchProductById(route.params.productId);
  }, [route.params.productId, fetchProductById]);

  const onAdd = async () => {
    if (!productDetail) {
      return;
    }

    try {
      await addToCart(productDetail.id, 1);
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

  if (error || !productDetail) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy sản phẩm'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{productDetail.name}</Text>
      <Text style={styles.price}>{productDetail.price.toLocaleString('vi-VN')} đ</Text>
      <Text style={styles.description}>{productDetail.description ?? 'Không có mô tả'}</Text>
      <Text style={styles.stock}>Tồn kho: {productDetail.stock}</Text>

      <TouchableOpacity style={styles.button} onPress={onAdd}>
        <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  price: { fontSize: 20, color: '#16a34a', fontWeight: '700', marginBottom: 12 },
  description: { fontSize: 16, color: '#475569', marginBottom: 12 },
  stock: { color: '#64748b', marginBottom: 20 },
  button: { backgroundColor: '#6366f1', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  errorText: { color: '#ef4444', fontSize: 16 },
});
