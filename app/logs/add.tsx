// 11/04/26: Adds habit log with details.
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, Pressable, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { habitLogsTable } from '@/db/schema';
import { Habit, HabitContext } from '../_layout';

// 11/04/26: Formats today as ISO date.
const todayIso = () => new Date().toISOString().slice(0, 10);

// 11/04/26: Renders add log screen form.
export default function AddLog() {
  const router = useRouter();
  const context = useContext(HabitContext);

  const habits = context?.habits ?? [];
  const [habitId, setHabitId] = useState<number>(habits[0]?.id ?? 0);
  const [logDate, setLogDate] = useState(todayIso());
  const [metricValue, setMetricValue] = useState('1');
  const [notes, setNotes] = useState('');

  // 11/04/26: Derives category from selected habit.
  const categoryId = habits.find((h: Habit) => h.id === habitId)?.categoryId ?? 0;

  const saveLog = async () => {
    const value = Number(metricValue);
    if (!habitId || !categoryId || !logDate.trim() || !Number.isFinite(value)) return;

    await db.insert(habitLogsTable).values({
      habitId,
      categoryId,
      logDate: logDate.trim(),
      metricValue: value,
      notes: notes.trim() || null,
    });

    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Add Log</Text>

      <Text style={{ marginBottom: 6 }}>Habit</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {habits.map((habit) => (
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

      <TextInput placeholder="Date (YYYY-MM-DD)" value={logDate} onChangeText={setLogDate} />
      <TextInput
        placeholder="Metric value"
        value={metricValue}
        onChangeText={setMetricValue}
        keyboardType="numeric"
      />
      <TextInput placeholder="Notes" value={notes} onChangeText={setNotes} />
      <Button title="Save Log" onPress={saveLog} />
    </View>
  );
}
