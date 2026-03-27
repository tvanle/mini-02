import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Category, RootStackParamList } from '../types';
import { categoryService } from '../services/category.service';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

export function CategoryScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      const res = await categoryService.getAll();
      if (res.success && res.data) setCategories(res.data);
    })();
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Electronics & Gadgets</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ProductList', { categoryId: item.id, categoryName: item.name })}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>📁</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>{item.description || 'No description'}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View>
            <Text>Không có danh mục</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 10 },
  content: { gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', gap: 10 },
  iconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  name: { fontSize: 20, fontWeight: '700' },
  desc: { marginTop: 4, color: '#64748b' },
});
