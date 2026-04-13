// 11/04/26: Edits existing target configuration.
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Button, Pressable, Text, TextInput, View } from 'react-native';

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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Edit Target</Text>

      <Text style={{ marginBottom: 6 }}>Period</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <Pressable onPress={() => setPeriodType('weekly')}>
          <Text style={{ color: periodType === 'weekly' ? '#0a7ea4' : '#111827' }}>Weekly</Text>
        </Pressable>
        <Pressable onPress={() => setPeriodType('monthly')}>
          <Text style={{ color: periodType === 'monthly' ? '#0a7ea4' : '#111827' }}>Monthly</Text>
        </Pressable>
      </View>

      <Text style={{ marginBottom: 6 }}>Habit (optional)</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <Pressable
          onPress={() => setHabitId(null)}
          style={{
            borderWidth: 1,
            borderColor: habitId === null ? '#0a7ea4' : '#d1d5db',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
          }}
        >
          <Text>All Habits</Text>
        </Pressable>
        {habits.map((habit: Habit) => (
          <Pressable
            key={habit.id}
            onPress={() => setHabitId(habit.id)}
            style={{
              borderWidth: 1,
              borderColor: habitId === habit.id ? '#0a7ea4' : '#d1d5db',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text>{habit.name}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        placeholder="Target value"
        value={targetValue}
        onChangeText={setTargetValue}
        keyboardType="numeric"
      />
      <Button title="Save Changes" onPress={saveChanges} />
      <Button title="Delete Target" onPress={deleteTarget} />
    </View>
  );
}
