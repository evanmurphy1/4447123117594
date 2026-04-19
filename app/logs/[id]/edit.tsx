// 11/04/26: Edits habit log entry fields.
import { and, eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { habitLogsTable } from '@/db/schema';
import { Habit, HabitContext } from '../../_layout';

// 16/04/26: Parse iso to date.
const parseIsoDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
};

// 16/04/26: Date to iso string.
const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 16/04/26: Shift iso by days.
const shiftIsoDate = (value: string, days: number) => {
  const base = parseIsoDate(value);
  base.setDate(base.getDate() + days);
  return toIsoDate(base);
};

// 16/04/26: Readable date label.
const prettyDate = (value: string) =>
  parseIsoDate(value).toLocaleDateString('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

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
  const theme = context?.theme;
  const userId = context?.user?.id ?? 0;

  const habits = context?.habits ?? [];
  const [log, setLog] = useState<HabitLogRow | null>(null);
  const [habitId, setHabitId] = useState<number>(0);
  const [logDate, setLogDate] = useState('');
  const [metricValue, setMetricValue] = useState('0');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      const rows = await db
        .select()
        .from(habitLogsTable)
        .where(and(eq(habitLogsTable.id, Number(id)), eq(habitLogsTable.userId, userId)));
      const row = rows[0] as HabitLogRow | undefined;
      if (!row) return;
      setLog(row);
      setHabitId(row.habitId);
      setLogDate(row.logDate);
      setMetricValue(String(row.metricValue));
      setNotes(row.notes ?? '');
    };
    load();
  }, [id, userId]);

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
        userId,
        categoryId,
        logDate: logDate.trim(),
        metricValue: value,
        notes: notes.trim() || null,
      })
      .where(and(eq(habitLogsTable.id, Number(id)), eq(habitLogsTable.userId, userId)));

    router.back();
  };

  const deleteLog = async () => {
    await db.delete(habitLogsTable).where(and(eq(habitLogsTable.id, Number(id)), eq(habitLogsTable.userId, userId)));
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
      <Text style={[styles.title, theme ? { color: theme.text } : null]}>Edit Log</Text>

      <Text style={[styles.label, theme ? { color: theme.textMuted } : null]}>Habit</Text>
      <View style={styles.chipRow}>
        {habits.map((habit) => {
          const active = habitId === habit.id;
          return (
            <Pressable
              key={habit.id}
              onPress={() => setHabitId(habit.id)}
              style={[
                styles.chip,
                {
                  borderColor: active ? theme?.buttonBorder ?? '#4b5563' : theme?.border ?? '#3f3f46',
                  backgroundColor: active ? theme?.buttonBg ?? '#2f2f2f' : theme?.panel ?? '#1f1f1f',
                },
                active ? styles.chipActive : null,
              ]}
            >
              <Text style={[styles.chipText, theme ? { color: theme.text } : null]}>
                {active ? `✓ ${habit.name}` : habit.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, theme ? { color: theme.textMuted } : null]}>Date</Text>
      <View style={styles.dateRow}>
        <Pressable
          style={[styles.dateStep, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
          onPress={() => setLogDate((prev) => shiftIsoDate(prev, -1))}
        >
          <Text style={[styles.dateStepText, theme ? { color: theme.text } : null]}>-1 day</Text>
        </Pressable>
        <View style={[styles.dateCard, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}>
          <Text style={[styles.dateMain, theme ? { color: theme.text } : null]}>{prettyDate(logDate)}</Text>
          <Text style={[styles.dateSub, theme ? { color: theme.textMuted } : null]}>{logDate}</Text>
        </View>
        <Pressable
          style={[styles.dateStep, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
          onPress={() => setLogDate((prev) => shiftIsoDate(prev, 1))}
        >
          <Text style={[styles.dateStepText, theme ? { color: theme.text } : null]}>+1 day</Text>
        </Pressable>
      </View>
      <TextInput
        style={[styles.input, theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null]}
        placeholder="Metric value"
        placeholderTextColor={theme ? theme.textMuted : '#6b7280'}
        value={metricValue}
        onChangeText={setMetricValue}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null]}
        placeholder="Notes"
        placeholderTextColor={theme ? theme.textMuted : '#6b7280'}
        value={notes}
        onChangeText={setNotes}
      />
      {/* 13/04/26: Consistent dark primary action. */}
      <Pressable
        style={[styles.primaryButton, theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null]}
        onPress={saveChanges}
      >
        <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Save Changes</Text>
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
  chipActive: {
    borderWidth: 2,
  },
  chipText: {
    color: '#e5e7eb',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dateStep: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dateStepText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '600',
  },
  dateCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#262626',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateMain: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  dateSub: {
    color: '#9ca3af',
    marginTop: 2,
    fontSize: 12,
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
