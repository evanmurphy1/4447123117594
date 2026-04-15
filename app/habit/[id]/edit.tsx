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
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={{ fontSize: 22, marginBottom: 12 }}>Edit Habit</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Habit Name" />

      <Text style={{ marginTop: 12, marginBottom: 8 }}>Category</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {categories.map((category) => {
          const active = categoryId === category.id;
          return (
            <Pressable
              key={category.id}
              onPress={() => setCategoryId(category.id)}
              style={{
                borderWidth: 1,
                borderColor: active ? category.color : '#d1d5db',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text>{category.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes"
        style={{ marginTop: 12, marginBottom: 12 }}
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
