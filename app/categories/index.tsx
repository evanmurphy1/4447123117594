// 11/04/26: Lists categories with edit actions.
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Button, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '@/db/client';
import { categoriesTable } from '@/db/schema';
import { Category, HabitContext } from '../_layout';

// 11/04/26: Renders category list screen.
export default function CategoriesIndex() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const load = async () => {
      const rows = await db.select().from(categoriesTable);
      setCategories(rows as Category[]);
      context?.setCategories(rows as Category[]);
    };
    load();
  }, [context]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Categories</Text>
      <Button title="Add Category" onPress={() => router.push('/categories/add')} />
      <View style={{ marginTop: 12, gap: 10 }}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => router.push({ pathname: '/categories/[id]/edit', params: { id: category.id.toString() } })}
            style={{ borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: 10 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{category.name}</Text>
            <Text>Color: {category.color}</Text>
            <Text>Icon: {category.icon}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
