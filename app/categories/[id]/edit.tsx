// 11/04/26: Edits category details and deletes.
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { categoriesTable, habitsTable, habitLogsTable } from '@/db/schema';
import { Category, HabitContext } from '../../_layout';

// 11/04/26: Renders edit category screen.
export default function EditCategory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(HabitContext);
  const theme = context?.theme;

  const categories = context?.categories ?? [];
  const category = categories.find((c: Category) => c.id === Number(id));

  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? '');

  if (!category) return null;

  const saveChanges = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    await db
      .update(categoriesTable)
      .set({ name: trimmed, color: color.trim() || category.color })
      .where(eq(categoriesTable.id, Number(id)));

    const rows = await db.select().from(categoriesTable);
    context?.setCategories(rows);
    router.back();
  };

  const deleteCategory = async () => {
    await db.delete(habitLogsTable).where(eq(habitLogsTable.categoryId, category.id));
    await db.delete(habitsTable).where(eq(habitsTable.categoryId, category.id));
    await db.delete(categoriesTable).where(eq(categoriesTable.id, category.id));
    const rows = await db.select().from(categoriesTable);
    context?.setCategories(rows);
    router.back();
  };

  return (
    <View style={[styles.container, theme ? { backgroundColor: theme.background } : null]}>
      <Pressable
        style={[styles.backButton, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backButtonText, theme ? { color: theme.text } : null]}>Back</Text>
      </Pressable>
      <Text style={[styles.title, theme ? { color: theme.text } : null]}>Edit Category</Text>
      <TextInput
        style={[styles.input, theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null]}
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor={theme ? theme.textMuted : '#6b7280'}
      />
      <TextInput
        style={[styles.input, theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null]}
        value={color}
        onChangeText={setColor}
        placeholder="Color (hex)"
        placeholderTextColor={theme ? theme.textMuted : '#6b7280'}
      />
      {/* 13/04/26: Consistent dark primary action. */}
      <Pressable
        style={[styles.primaryButton, theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null]}
        onPress={saveChanges}
      >
        <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Save Changes</Text>
      </Pressable>
      <Pressable style={styles.dangerButton} onPress={deleteCategory}>
        <Text style={styles.dangerButtonText}>Delete Category</Text>
      </Pressable>
    </View>
  );
}

// 13/04/26: Dark themed styles for edit.
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
  dangerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#3f1f1f',
    borderColor: '#7f1d1d',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  dangerButtonText: {
    color: '#fecaca',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#1f1f1f',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
});
