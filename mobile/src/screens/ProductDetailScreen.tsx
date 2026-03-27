import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    if (!productDetail) return;
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
        <ActivityIndicator size="large" color="#6d28d9" />
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
      <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.banner}>
        <Text style={styles.name}>{productDetail.name}</Text>
        <Text style={styles.price}>{productDetail.price.toLocaleString('vi-VN')} đ</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mô tả</Text>
        <Text style={styles.description}>{productDetail.description ?? 'Không có mô tả'}</Text>
        <Text style={styles.stock}>Tồn kho: {productDetail.stock}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onAdd}>
        <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6ff', gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#5b21b6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7,
  },
  name: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 6 },
  price: { fontSize: 18, color: '#ede9fe', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  description: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 10 },
  stock: { color: '#64748b' },
  button: { backgroundColor: '#6d28d9', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorText: { color: '#ef4444', fontSize: 16 },
});
