// 11/04/26: Adds weekly or monthly targets.
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, Pressable, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { targetsTable } from '@/db/schema';
import { Habit, HabitContext } from '../_layout';

// 11/04/26: Renders add target form.
export default function AddTarget() {
  const router = useRouter();
  const context = useContext(HabitContext);

  const habits = context?.habits ?? [];
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('weekly');
  const [targetValue, setTargetValue] = useState('5');
  const [habitId, setHabitId] = useState<number | null>(habits[0]?.id ?? null);

  const saveTarget = async () => {
    const value = Number(targetValue);
    if (!Number.isFinite(value) || value <= 0) return;

    await db.insert(targetsTable).values({
      periodType,
      targetValue: value,
      habitId,
      categoryId: null,
    });

    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Add Target</Text>

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
      <Button title="Save Target" onPress={saveTarget} />
    </View>
  );
}
