import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
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
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  description: { color: '#64748b' },
  errorText: { color: '#ef4444', fontSize: 16 },
});
