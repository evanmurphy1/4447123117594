// 11/04/26: Adds new category with fields.
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { categoriesTable } from '@/db/schema';
import { HabitContext } from '../_layout';

// 11/04/26: Renders add category form.
export default function AddCategory() {
  const router = useRouter();
  const context = useContext(HabitContext);

  const [name, setName] = useState('');
  const [color, setColor] = useState('#22c55e');

  const saveCategory = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    await db.insert(categoriesTable).values({
      name: trimmed,
      color: color.trim() || '#22c55e',
      icon: 'tag',
    });

    const rows = await db.select().from(categoriesTable);
    context?.setCategories(rows);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Add Category</Text>
      <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#6b7280" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Color (hex)" placeholderTextColor="#6b7280" value={color} onChangeText={setColor} />
      {/* 13/04/26: Consistent dark primary action. */}
      <Pressable style={styles.primaryButton} onPress={saveCategory}>
        <Text style={styles.primaryButtonText}>Save Category</Text>
      </Pressable>
    </View>
  );
}

// 13/04/26: Dark themed styles for forms.
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#171717',
    flex: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    color: '#3b82f6',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#262626',
    color: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f1f1f',
    borderColor: '#3f3f46',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
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
