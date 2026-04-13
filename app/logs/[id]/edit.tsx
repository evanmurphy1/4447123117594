// 11/04/26: Edits habit log entry fields.
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Button, Pressable, Text, TextInput, View } from 'react-native';

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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Edit Log</Text>

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
      <Button title="Save Changes" onPress={saveChanges} />
      <Button title="Delete Log" onPress={deleteLog} />
    </View>
  );
}
