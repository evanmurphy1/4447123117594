// 14/04/26: Guided habit form.
import { eq } from 'drizzle-orm';
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
  const theme = context?.theme;

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [nameError, setNameError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const saveHabit = async () => {
    if (!context) return;
    const userId = context.user?.id;
    if (!userId) return;
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
      userId,
      name: trimmedName,
      metricType: 'count',
      notes: notes.trim() || null,
      categoryId: chosenCategoryId,
    });

    const rows = await db.select().from(habitsTable).where(eq(habitsTable.userId, userId));
    context.setHabits(rows);
    router.back();
  };

  if (!context) return null;

  return (
    <View style={[styles.screen, theme ? { backgroundColor: theme.background } : null]}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={[styles.bgWash, theme ? { backgroundColor: theme.wash } : null]} />
      <View style={[styles.bgStripe, theme ? { backgroundColor: theme.stripe } : null]} />
      <View style={styles.container}>
        <Pressable
          style={[
            styles.backButton,
            theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null,
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, theme ? { color: theme.text } : null]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, theme ? { color: theme.text } : null]}>Create Habit</Text>
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

        <Text style={[styles.label, theme ? { color: theme.textMuted } : null]}>Category</Text>
        <View style={styles.chipRow}>
          {categories.map((category) => {
            const active = (selectedCategoryId ?? categories[0]?.id) === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategoryId(category.id)}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? theme?.buttonBorder ?? 'rgba(255,255,255,0.34)' : theme?.border ?? 'rgba(255,255,255,0.22)',
                    backgroundColor: active ? theme?.buttonBg ?? 'rgba(255,255,255,0.2)' : theme?.panel ?? 'rgba(255,255,255,0.1)',
                  },
                  active ? styles.chipActive : null,
                ]}
              >
                <Text style={[styles.chipText, theme ? { color: theme.text } : null]}>
                  {active ? `✓ ${category.name}` : category.name}
                </Text>
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
        <Pressable
          style={[
            styles.primaryButton,
            theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
          ]}
          onPress={saveHabit}
        >
          <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Save Habit</Text>
        </Pressable>
      </View>
    </View>
  );
}

// 13/04/26: Dark themed styles for habit form.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1224',
  },
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
    flex: 1,
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
    backgroundColor: 'rgba(125, 211, 252, 0.16)',
    top: 30,
    right: -130,
    transform: [{ rotate: '-16deg' }],
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    color: '#f8fafc',
    fontWeight: '600',
  },
  label: {
    marginTop: 12,
    marginBottom: 8,
    color: '#cbd5e1',
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
  chipActive: {
    borderWidth: 2,
  },
  chipText: {
    color: '#f8fafc',
  },
  errorText: {
    color: '#fca5a5',
    marginBottom: 8,
    fontSize: 12,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.34)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
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
