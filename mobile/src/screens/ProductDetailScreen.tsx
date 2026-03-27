import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Product, RootStackParamList } from '../types';
import { productService } from '../services/product.service';
import { orderService } from '../services/order.service';
import { getCurrentUserId } from '../utils/session';
import { isProductLiked, toggleProductLike } from '../utils/likes';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route, navigation }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [liked, setLiked] = useState(false);
  const sliderRef = useRef<ScrollView>(null);
  const imageWidth = Dimensions.get('window').width - 32;
  const images = product?.images ?? [];
  const colors = images.length > 0 ? images.map((img) => img.colorHex) : ['#111827', '#d1d5db', '#3730a3'];

  useEffect(() => {
    (async () => {
      const [res, likedState] = await Promise.all([
        productService.getById(route.params.productId),
        isProductLiked(route.params.productId),
      ]);
      if (res.success && res.data) setProduct(res.data);
      setLiked(likedState);
    })();
  }, [route.params.productId]);

  const onToggleLike = async () => {
    if (!product) return;
    const next = await toggleProductLike(product.id);
    setLiked(next);
  };

  const selectColor = (idx: number) => {
    setSelectedColor(idx);
    sliderRef.current?.scrollTo({ x: idx * imageWidth, animated: true });
  };

  const addToCart = async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập trước', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (!product) return;
    const res = await orderService.addToCart(product.id, quantity);
    if (!res.success) {
      Alert.alert('Lỗi', res.error || 'Không thêm được vào giỏ');
      return;
    }
    Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
  };

  if (!product) return <View style={styles.loading}><Text>Đang tải...</Text></View>;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.imageWrap}>
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / imageWidth);
              setSelectedColor(index);
            }}
          >
            {(images.length > 0 ? images : [{ imageUrl: product.image || '' }]).map((img, idx) => (
              <Image
                key={`${img.imageUrl}-${idx}`}
                source={{ uri: img.imageUrl || 'https://picsum.photos/seed/fallback-product/900/900' }}
                style={[styles.image, { width: imageWidth }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.badges}>
            <View style={[styles.tag, { backgroundColor: '#4338ca' }]}>
              <Text style={styles.tagText}>NEW ARRIVAL</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#22c55e' }]}>
              <Text style={styles.tagText}>FREE SHIPPING</Text>
            </View>
          </View>
        </View>

        <Text style={styles.label}>AUDIO ELITE SERIES</Text>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${(product.price / 23000).toFixed(2)}</Text>
          <Text style={styles.oldPrice}>${((product.price / 23000) * 1.25).toFixed(2)}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>20% OFF</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Color</Text>
        <Text style={styles.sectionSub}>Midnight Obsidian</Text>
        <View style={styles.colorRow}>
          {colors.map((color, idx) => (
            <Pressable
              key={color}
              onPress={() => selectColor(idx)}
              style={[
                styles.colorOuter,
                selectedColor === idx && styles.colorOuterSelected,
              ]}
            >
              <View style={[styles.colorInner, { backgroundColor: color }]} />
            </Pressable>
          ))}
        </View>

        <View style={styles.descBox}>
          <Text style={styles.descTitle}>Experience Excellence</Text>
          <Text style={styles.desc}>{product.description || 'Không có mô tả'}</Text>
        </View>

        <View style={styles.featureGrid}>
          {[
            'Hybrid ANC',
            '40hr Battery',
            'LDAC Support',
            'Fast Charge',
          ].map((item) => (
            <View key={item} style={styles.featureCard}>
              <Text style={styles.featureIcon}>✦</Text>
              <Text style={styles.featureText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.qtyBox}>
          <Text style={styles.qtyLabel}>Quantity</Text>
          <View style={styles.qtyControls}>
            <Pressable style={styles.qtyBtn} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Text style={styles.qtyBtnText}>-</Text>
            </Pressable>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <Pressable style={[styles.qtyBtn, styles.qtyBtnPlus]} onPress={() => setQuantity((q) => q + 1)}>
              <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.likeBtn} onPress={onToggleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? '#e11d48' : '#4b5563'}
          />
        </Pressable>
        <Pressable style={styles.cartBtn} onPress={addToCart}>
          <Ionicons name="bag-handle-outline" size={20} color="#fff" />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 120, gap: 10 },
  imageWrap: { position: 'relative' },
  image: { height: 280, borderRadius: 14, backgroundColor: '#0f172a', marginRight: 0 },
  badges: { position: 'absolute', top: 10, right: 10, gap: 6 },
  tag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: '#fff', fontWeight: '700', fontSize: 10 },
  label: { marginTop: 6, color: '#6b7280', letterSpacing: 1, fontSize: 12 },
  name: { fontSize: 32, fontWeight: '800', color: '#111827', lineHeight: 38 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { fontSize: 30, color: '#4338ca', fontWeight: '800' },
  oldPrice: { fontSize: 16, textDecorationLine: 'line-through', color: '#9ca3af', marginTop: 8 },
  badge: { backgroundColor: '#bbf7d0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  badgeText: { color: '#166534', fontWeight: '700', fontSize: 12 },
  descBox: { marginTop: 6, backgroundColor: '#e5e7eb', borderRadius: 14, padding: 14 },
  descTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6, color: '#111827' },
  desc: { color: '#4b5563', fontSize: 15, lineHeight: 22 },
  featureGrid: { marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureCard: {
    width: '48.8%',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  featureIcon: { fontSize: 18, color: '#4338ca', marginBottom: 4 },
  featureText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  sectionTitle: { marginTop: 10, fontSize: 20, fontWeight: '700', color: '#111827' },
  sectionSub: { color: '#6b7280', marginTop: -2, marginBottom: 8 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  colorOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOuterSelected: { borderColor: '#312e81' },
  colorInner: { width: 24, height: 24, borderRadius: 12 },
  qtyBox: { marginTop: 8, backgroundColor: '#e5e7eb', borderRadius: 14, padding: 12 },
  qtyLabel: { fontSize: 18, fontWeight: '700' },
  qtyControls: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  qtyBtnPlus: { backgroundColor: '#4338ca' },
  qtyBtnText: { fontSize: 20, color: '#111827', fontWeight: '700' },
  qtyValue: { fontSize: 24, fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  likeBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtn: {
    flex: 1,
    backgroundColor: '#4338ca',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cartBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
