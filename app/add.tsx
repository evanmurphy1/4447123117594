// 14/04/26: Guided habit form.
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import FormField from '@/components/FormField';
import { db } from '@/db/client';
import { habitsTable } from '@/db/schema';
import { HabitContext } from './_layout';

export default function AddHabit() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const categories = context?.categories ?? [];

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [nameError, setNameError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const saveHabit = async () => {
    if (!context) return;
    const trimmedName = name.trim();
    const chosenCategoryId = selectedCategoryId ?? categories[0]?.id;
    const nextNameError = trimmedName ? '' : 'Habit name is required.';
    const nextCategoryError = chosenCategoryId ? '' : 'Select a category first.';
    setNameError(nextNameError);
    setCategoryError(nextCategoryError);
    if (nextNameError || nextCategoryError) {
      Alert.alert('Fix required fields', 'Please complete the highlighted form fields.');
      return;
    }

    await db.insert(habitsTable).values({
      name: trimmedName,
      metricType: 'count',
      notes: notes.trim() || null,
      categoryId: chosenCategoryId,
    });

    const rows = await db.select().from(habitsTable);
    context.setHabits(rows);
    router.back();
  };

  if (!context) return null;

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Create Habit</Text>
      <FormField
        label="Habit Name"
        placeholder="e.g. Walk 8k steps"
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (nameError) setNameError('');
        }}
        error={nameError}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {categories.map((category) => {
          const active = (selectedCategoryId ?? categories[0]?.id) === category.id;
          return (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategoryId(category.id)}
              style={{
                ...styles.chip,
                borderColor: active ? '#4b5563' : '#3f3f46',
                backgroundColor: active ? '#2f2f2f' : '#1f1f1f',
              }}
            >
              <Text style={styles.chipText}>{category.name}</Text>
            </Pressable>
          );
        })}
      </View>
      {categoryError ? <Text style={styles.errorText}>{categoryError}</Text> : null}

      <FormField
        label="Notes (Optional)"
        placeholder="Helpful context for this habit"
        value={notes}
        onChangeText={setNotes}
      />
      {/* 13/04/26: Primary action for habit save. */}
      <Pressable style={styles.primaryButton} onPress={saveHabit}>
        <Text style={styles.primaryButtonText}>Save Habit</Text>
      </Pressable>
    </View>
  );
}

// 13/04/26: Dark themed styles for habit form.
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
    color: '#3b82f6',
    fontWeight: '600',
  },
  label: {
    marginTop: 12,
    marginBottom: 8,
    color: '#9ca3af',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
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
  errorText: {
    color: '#fca5a5',
    marginBottom: 8,
    fontSize: 12,
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
