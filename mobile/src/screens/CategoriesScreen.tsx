import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useCategoryStore } from '../stores/category.store';
import type { Category, MainTabParamList, RootStackParamList } from '../types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type CategoriesNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Categories'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: CategoriesNav;
};

export function CategoriesScreen({ navigation }: Props) {
  const { categories, loading, error, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.headerBanner}>
        <Text style={styles.bannerTitle}>Danh mục</Text>
        <Text style={styles.bannerText}>Chọn nhóm sản phẩm bạn muốn khám phá.</Text>
      </LinearGradient>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: Category }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductList', { categoryId: item.id, title: item.name })}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description ?? 'Không có mô tả'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6ff', paddingTop: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBanner: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#5b21b6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7,
  },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  bannerText: { color: '#ede9fe', lineHeight: 20 },
  list: { padding: 16, paddingBottom: 110 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  name: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  description: { color: '#64748b', lineHeight: 20 },
  errorText: { color: '#ef4444', fontSize: 16 },
});
