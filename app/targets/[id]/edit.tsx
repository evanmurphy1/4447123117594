// 11/04/26: Edits existing target configuration.
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { targetsTable } from '@/db/schema';
import { Habit, HabitContext } from '../../_layout';

// 11/04/26: Defines target row type.
type TargetRow = {
  id: number;
  periodType: string;
  targetValue: number;
  categoryId: number | null;
  habitId: number | null;
};

// 11/04/26: Renders edit target screen.
export default function EditTarget() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(HabitContext);

  const habits = context?.habits ?? [];
  const [target, setTarget] = useState<TargetRow | null>(null);
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('weekly');
  const [targetValue, setTargetValue] = useState('0');
  const [habitId, setHabitId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const rows = await db.select().from(targetsTable).where(eq(targetsTable.id, Number(id)));
      const row = rows[0] as TargetRow | undefined;
      if (!row) return;
      setTarget(row);
      setPeriodType(row.periodType === 'monthly' ? 'monthly' : 'weekly');
      setTargetValue(String(row.targetValue));
      setHabitId(row.habitId ?? null);
    };
    load();
  }, [id]);

  if (!target) return null;

  const saveChanges = async () => {
    const value = Number(targetValue);
    if (!Number.isFinite(value) || value <= 0) return;

    await db
      .update(targetsTable)
      .set({ periodType, targetValue: value, habitId })
      .where(eq(targetsTable.id, Number(id)));

    router.back();
  };

  const deleteTarget = async () => {
    await db.delete(targetsTable).where(eq(targetsTable.id, Number(id)));
    router.back();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Edit Target</Text>

      <Text style={styles.label}>Period</Text>
      <View style={styles.row}>
        <Pressable onPress={() => setPeriodType('weekly')}>
          <Text style={{ color: periodType === 'weekly' ? '#e5e7eb' : '#9ca3af' }}>Weekly</Text>
        </Pressable>
        <Pressable onPress={() => setPeriodType('monthly')}>
          <Text style={{ color: periodType === 'monthly' ? '#e5e7eb' : '#9ca3af' }}>Monthly</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Habit (optional)</Text>
      <View style={styles.chipRow}>
        <Pressable
          onPress={() => setHabitId(null)}
          style={{
            ...styles.chip,
            borderColor: habitId === null ? '#4b5563' : '#3f3f46',
            backgroundColor: habitId === null ? '#2f2f2f' : '#1f1f1f',
          }}
        >
          <Text style={styles.chipText}>All Habits</Text>
        </Pressable>
        {habits.map((habit: Habit) => (
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

      <TextInput
        style={styles.input}
        placeholder="Target value"
        placeholderTextColor="#6b7280"
        value={targetValue}
        onChangeText={setTargetValue}
        keyboardType="numeric"
      />
      {/* 13/04/26: Consistent dark primary action. */}
      <Pressable style={styles.primaryButton} onPress={saveChanges}>
        <Text style={styles.primaryButtonText}>Save Changes</Text>
      </Pressable>
      <Pressable style={styles.dangerButton} onPress={deleteTarget}>
        <Text style={styles.dangerButtonText}>Delete Target</Text>
      </Pressable>
    </View>
  );
}

// 13/04/26: Dark themed styles for targets.
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
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
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
