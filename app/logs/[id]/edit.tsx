// 11/04/26: Edits habit log entry fields.
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { habitLogsTable } from '@/db/schema';
import { Habit, HabitContext } from '../../_layout';

// 11/04/26: Defines log row shape.
type HabitLogRow = {
  id: number;
  habitId: number;
  categoryId: number;
  logDate: string;
  metricValue: number;
  notes: string | null;
};

// 11/04/26: Renders edit log screen form.
export default function EditLog() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(HabitContext);

  const habits = context?.habits ?? [];
  const [log, setLog] = useState<HabitLogRow | null>(null);
  const [habitId, setHabitId] = useState<number>(0);
  const [logDate, setLogDate] = useState('');
  const [metricValue, setMetricValue] = useState('0');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      const rows = await db.select().from(habitLogsTable).where(eq(habitLogsTable.id, Number(id)));
      const row = rows[0] as HabitLogRow | undefined;
      if (!row) return;
      setLog(row);
      setHabitId(row.habitId);
      setLogDate(row.logDate);
      setMetricValue(String(row.metricValue));
      setNotes(row.notes ?? '');
    };
    load();
  }, [id]);

  // 11/04/26: Derives category from selected habit.
  const categoryId =
    habits.find((h: Habit) => h.id === habitId)?.categoryId ?? log?.categoryId ?? 0;

  if (!log) return null;

  const saveChanges = async () => {
    const value = Number(metricValue);
    if (!habitId || !categoryId || !logDate.trim() || !Number.isFinite(value)) return;

    await db
      .update(habitLogsTable)
      .set({
        habitId,
        categoryId,
        logDate: logDate.trim(),
        metricValue: value,
        notes: notes.trim() || null,
      })
      .where(eq(habitLogsTable.id, Number(id)));

    router.back();
  };

  const deleteLog = async () => {
    await db.delete(habitLogsTable).where(eq(habitLogsTable.id, Number(id)));
    router.back();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Edit Log</Text>

      <Text style={styles.label}>Habit</Text>
      <View style={styles.chipRow}>
        {habits.map((habit) => (
          <Pressable
            key={habit.id}
            onPress={() => setHabitId(habit.id)}
            style={{
              ...styles.chip,
              borderColor: habitId === habit.id ? '#4b5563' : '#3f3f46',
              backgroundColor: habitId === habit.id ? '#2f2f2f' : '#1f1f1f',
            }}
          >
            <Text style={styles.chipText}>{habit.name}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" placeholderTextColor="#6b7280" value={logDate} onChangeText={setLogDate} />
      <TextInput
        style={styles.input}
        placeholder="Metric value"
        placeholderTextColor="#6b7280"
        value={metricValue}
        onChangeText={setMetricValue}
        keyboardType="numeric"
      />
      <TextInput style={styles.input} placeholder="Notes" placeholderTextColor="#6b7280" value={notes} onChangeText={setNotes} />
      {/* 13/04/26: Consistent dark primary action. */}
      <Pressable style={styles.primaryButton} onPress={saveChanges}>
        <Text style={styles.primaryButtonText}>Save Changes</Text>
      </Pressable>
      <Pressable style={styles.dangerButton} onPress={deleteLog}>
        <Text style={styles.dangerButtonText}>Delete Log</Text>
      </Pressable>
    </View>
  );
}

// 13/04/26: Dark themed styles for logs.
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
  label: {
    marginBottom: 6,
    color: '#9ca3af',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
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
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600',
  },
});
