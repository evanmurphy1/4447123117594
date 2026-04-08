// 08/04/26 Habit detail page created for viewing, logging, and deleting habits.
import { and, eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useMemo, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { habitLogsTable, habitsTable, targetsTable } from '@/db/schema';
import { Habit, HabitContext } from '../_layout';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(HabitContext);
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
      .where(and(eq(habitLogsTable.habitId, habit.id), eq(habitLogsTable.logDate, todayIso())));

    if (existingToday.length > 0) {
      await db
        .update(habitLogsTable)
        .set({ metricValue: value, notes: logNote.trim() || null })
        .where(eq(habitLogsTable.id, existingToday[0].id));
      return;
    }

    await db.insert(habitLogsTable).values({
      habitId: habit.id,
      categoryId: habit.categoryId,
      logDate: todayIso(),
      metricValue: value,
      notes: logNote.trim() || null,
    });
  };

  const deleteHabit = async () => {
    await db.delete(habitLogsTable).where(eq(habitLogsTable.habitId, habit.id));
    await db.delete(targetsTable).where(eq(targetsTable.habitId, habit.id));
    await db.delete(habitsTable).where(eq(habitsTable.id, habit.id));
    const rows = await db.select().from(habitsTable);
    context.setHabits(rows);
    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>{habit.name}</Text>
      <Text>Category: {category?.name ?? 'Unknown'}</Text>
      <Text>Metric Type: {habit.metricType}</Text>
      <Text style={{ marginBottom: 10 }}>Notes: {habit.notes || 'No notes'}</Text>

      <Text style={{ fontWeight: '600' }}>Log Today ({todayIso()})</Text>
      <TextInput
        value={metricValue}
        onChangeText={setMetricValue}
        keyboardType="numeric"
        placeholder={habit.metricType === 'minutes' ? 'Minutes' : 'Count'}
      />
      <TextInput
        value={logNote}
        onChangeText={setLogNote}
        placeholder="Log note (optional)"
        style={{ marginBottom: 12 }}
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
      <View style={{ marginTop: 8 }}>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    </View>
  );
}
