// 11/04/26: Lists categories with edit actions.
import { useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '@/db/client';
import { categoriesTable } from '@/db/schema';
import { Category, HabitContext } from '../_layout';

// 11/04/26: Renders category list screen.
export default function CategoriesIndex() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const theme = context?.theme;
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
    <View style={[styles.screen, theme ? { backgroundColor: theme.background } : null]}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={[styles.bgWash, theme ? { backgroundColor: theme.wash } : null]} />
      <View style={[styles.bgStripe, theme ? { backgroundColor: theme.stripe } : null]} />
      <SafeAreaView style={styles.container}>
        <Pressable
          style={[
            styles.backButton,
            theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null,
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, theme ? { color: theme.text } : null]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, theme ? { color: theme.text } : null]}>Categories</Text>
        {/* 13/04/26: Uses consistent button styling. */}
        <Pressable
          style={[
            styles.primaryButton,
            theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
          ]}
          onPress={() => router.push('/categories/add')}
        >
          <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Add Category</Text>
        </Pressable>
        {/* 14/04/26: Scroll long category entries. */}
        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 120 }}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => router.push({ pathname: '/categories/[id]/edit', params: { id: category.id.toString() } })}
              style={[styles.card, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
            >
              <Text style={[styles.cardTitle, theme ? { color: theme.text } : null]}>{category.name}</Text>
              <Text style={[styles.cardMeta, theme ? { color: theme.textMuted } : null]}>Color: {category.color}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// 13/04/26: Dark themed styles for categories.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1224',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  bgWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 41, 59, 0.25)',
  },
  bgStripe: {
    position: 'absolute',
    width: 520,
    height: 220,
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    top: 40,
    right: -120,
    transform: [{ rotate: '-18deg' }],
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    color: '#f8fafc',
    fontWeight: '600',
  },
  list: {
    marginTop: 12,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  cardMeta: {
    color: '#cbd5e1',
    marginTop: 2,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.34)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
});
