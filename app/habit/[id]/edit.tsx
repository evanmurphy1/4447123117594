// 08/04/26 Habit edit page created for updating habit details.
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { habitsTable } from '@/db/schema';
import { Habit, HabitContext } from '../../_layout';

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(HabitContext);
  const theme = context?.theme;
  const habits = context?.habits ?? [];
  const categories = context?.categories ?? [];
  const habit = habits.find((h: Habit) => h.id === Number(id));

  const [name, setName] = useState(habit?.name ?? '');
  const [notes, setNotes] = useState(habit?.notes ?? '');
  const [categoryId, setCategoryId] = useState(habit?.categoryId ?? 0);

  if (!context || !habit) return null;

  const saveChanges = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    await db
      .update(habitsTable)
      .set({ name: trimmedName, metricType: 'count', notes: notes.trim() || null, categoryId })
      .where(eq(habitsTable.id, Number(id)));

    const rows = await db.select().from(habitsTable);
    context.setHabits(rows);
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
      <Text style={[styles.title, theme ? { color: theme.text } : null]}>Edit Habit</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Habit Name"
        placeholderTextColor={theme ? theme.textMuted : '#6b7280'}
        style={[styles.input, theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null]}
      />

      <Text style={[styles.label, theme ? { color: theme.textMuted } : null]}>Category</Text>
      <View style={styles.chipRow}>
        {categories.map((category) => {
          const active = categoryId === category.id;
          return (
            <Pressable
              key={category.id}
              onPress={() => setCategoryId(category.id)}
              style={{
                ...styles.chip,
                borderColor: active ? theme?.buttonBorder ?? category.color : theme?.border ?? '#d1d5db',
                backgroundColor: active ? theme?.buttonBg ?? '#f3f4f6' : theme?.panel ?? 'transparent',
              }}
            >
              <Text style={[styles.chipText, theme ? { color: theme.text } : null]}>{category.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes"
        placeholderTextColor={theme ? theme.textMuted : '#6b7280'}
        style={[
          styles.input,
          styles.notesInput,
          theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null,
        ]}
      />
      <Button title="Save Changes" onPress={saveChanges} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#171717',
    flex: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    color: '#e5e7eb',
    fontWeight: '600',
  },
  label: {
    marginTop: 12,
    marginBottom: 8,
    color: '#9ca3af',
  },
  input: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#262626',
    color: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  notesInput: {
    marginTop: 12,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    color: '#e5e7eb',
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
