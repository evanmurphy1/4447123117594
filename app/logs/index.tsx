// 11/04/26: Lists habit logs with filters.
import { desc } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Button, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '@/db/client';
import { habitLogsTable } from '@/db/schema';
import { Habit, HabitContext } from '../_layout';

// 11/04/26: Defines shape for log row.
type HabitLogRow = {
  id: number;
  habitId: number;
  categoryId: number;
  logDate: string;
  metricValue: number;
  notes: string | null;
};

// 11/04/26: Renders logs list screen.
export default function LogsIndex() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const [logs, setLogs] = useState<HabitLogRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const rows = await db.select().from(habitLogsTable).orderBy(desc(habitLogsTable.logDate));
      setLogs(rows as HabitLogRow[]);
    };
    load();
  }, []);

  const habits = context?.habits ?? [];
  const habitLabel = (habitId: number) =>
    habits.find((h: Habit) => h.id === habitId)?.name ?? 'Unknown habit';

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Logs</Text>
      <Button title="Add Log" onPress={() => router.push('/logs/add')} />
      <View style={{ marginTop: 12, gap: 10 }}>
        {logs.map((log) => (
          <Pressable
            key={log.id}
            onPress={() => router.push({ pathname: '/logs/[id]/edit', params: { id: log.id.toString() } })}
            style={{ borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: 10 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{habitLabel(log.habitId)}</Text>
            <Text>Date: {log.logDate}</Text>
            <Text>Metric: {log.metricValue}</Text>
            <Text>Notes: {log.notes || 'None'}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
