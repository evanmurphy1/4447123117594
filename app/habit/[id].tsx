// 08/04/26 Habit detail page created for viewing, logging, and deleting habits.
import { and, eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useMemo, useState } from 'react';
import { Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { habitLogsTable, habitsTable, targetsTable } from '@/db/schema';
import { Habit, HabitContext } from '../_layout';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(HabitContext);
  const theme = context?.theme;
  const userId = context?.user?.id ?? 0;
  const habits = context?.habits ?? [];
  const categories = context?.categories;
  const habit = habits.find((h: Habit) => h.id === Number(id));

  const category = useMemo(
    () => categories?.find((item) => item.id === habit?.categoryId),
    [categories, habit?.categoryId]
  );

  const [metricValue, setMetricValue] = useState('1');
  const [logNote, setLogNote] = useState('');

  if (!context || !habit) return null;

  const saveTodayLog = async () => {
    const value = Number(metricValue);
    if (!Number.isFinite(value) || value < 0) return;

    const existingToday = await db
      .select()
      .from(habitLogsTable)
      .where(and(eq(habitLogsTable.userId, userId), eq(habitLogsTable.habitId, habit.id), eq(habitLogsTable.logDate, todayIso())));

    if (existingToday.length > 0) {
      await db
        .update(habitLogsTable)
        .set({ metricValue: value, notes: logNote.trim() || null })
        .where(eq(habitLogsTable.id, existingToday[0].id));
      return;
    }

    await db.insert(habitLogsTable).values({
      userId,
      habitId: habit.id,
      categoryId: habit.categoryId,
      logDate: todayIso(),
      metricValue: value,
      notes: logNote.trim() || null,
    });
  };

  const deleteHabit = async () => {
    await db.delete(habitLogsTable).where(and(eq(habitLogsTable.userId, userId), eq(habitLogsTable.habitId, habit.id)));
    await db.delete(targetsTable).where(and(eq(targetsTable.userId, userId), eq(targetsTable.habitId, habit.id)));
    await db.delete(habitsTable).where(and(eq(habitsTable.userId, userId), eq(habitsTable.id, habit.id)));
    const rows = await db.select().from(habitsTable).where(eq(habitsTable.userId, userId));
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
      <Text style={[styles.title, theme ? { color: theme.text } : null]}>{habit.name}</Text>
      <Text style={[styles.meta, theme ? { color: theme.textMuted } : null]}>Category: {category?.name ?? 'Unknown'}</Text>
      <Text style={[styles.meta, styles.metaBottom, theme ? { color: theme.textMuted } : null]}>
        Notes: {habit.notes || 'No notes'}
      </Text>

      <Text style={[styles.sectionTitle, theme ? { color: theme.text } : null]}>Log Today ({todayIso()})</Text>
      <TextInput
        value={metricValue}
        onChangeText={setMetricValue}
        keyboardType="numeric"
        placeholder="Count"
        placeholderTextColor={theme ? theme.textMuted : '#6b7280'}
        style={[styles.input, theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null]}
      />
      <TextInput
        value={logNote}
        onChangeText={setLogNote}
        placeholder="Log note (optional)"
        placeholderTextColor={theme ? theme.textMuted : '#6b7280'}
        style={[
          styles.input,
          styles.noteInput,
          theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null,
        ]}
      />
      <Button title="Save Today's Log" onPress={saveTodayLog} />

      <View style={{ marginTop: 12 }}>
        <Button
          title="Edit Habit"
          onPress={() =>
            router.push({
              pathname: '/habit/[id]/edit',
              params: { id },
            })
          }
        />
      </View>
      <View style={{ marginTop: 8 }}>
        <Button title="Delete Habit" onPress={deleteHabit} />
      </View>
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
    color: '#e5e7eb',
    fontWeight: '600',
  },
  meta: {
    color: '#9ca3af',
    marginTop: 4,
  },
  metaBottom: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#e5e7eb',
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
    marginTop: 8,
  },
  noteInput: {
    marginBottom: 12,
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
