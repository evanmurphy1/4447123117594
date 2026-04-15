// 11/04/26: Lists categories with edit actions.
import { useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '@/db/client';
import { categoriesTable } from '@/db/schema';
import { Category, HabitContext } from '../_layout';

// 11/04/26: Renders category list screen.
export default function CategoriesIndex() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const [categories, setCategories] = useState<Category[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        const rows = await db.select().from(categoriesTable);
        if (!active) return;
        setCategories(rows as Category[]);
        context?.setCategories(rows as Category[]);
      };

      load();

      return () => {
        active = false;
      };
    }, [context])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Categories</Text>
      {/* 13/04/26: Uses consistent button styling. */}
      <Pressable style={styles.primaryButton} onPress={() => router.push('/categories/add')}>
        <Text style={styles.primaryButtonText}>Add Category</Text>
      </Pressable>
      {/* 14/04/26: Scroll long category entries. */}
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 120 }}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => router.push({ pathname: '/categories/[id]/edit', params: { id: category.id.toString() } })}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>{category.name}</Text>
            <Text style={styles.cardMeta}>Color: {category.color}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// 13/04/26: Dark themed styles for categories.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#171717',
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    color: '#3b82f6',
    fontWeight: '600',
  },
  list: {
    marginTop: 12,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#262626',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  cardMeta: {
    color: '#9ca3af',
    marginTop: 2,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f1f1f',
    borderColor: '#3f3f46',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryButtonText: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600',
  },
});
