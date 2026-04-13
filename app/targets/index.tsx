// 11/04/26: Lists targets with progress summary.
import { desc } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Button, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '@/db/client';
import { habitLogsTable, targetsTable } from '@/db/schema';
import { Habit, HabitContext } from '../_layout';

// 11/04/26: Defines target row shape.
type TargetRow = {
  id: number;
  periodType: string;
  targetValue: number;
  categoryId: number | null;
  habitId: number | null;
};

// 11/04/26: Renders targets list screen.
export default function TargetsIndex() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [logCounts, setLogCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const load = async () => {
      const rows = await db.select().from(targetsTable).orderBy(desc(targetsTable.id));
      setTargets(rows as TargetRow[]);

      const logs = await db.select().from(habitLogsTable);
      const counts: Record<number, number> = {};
      logs.forEach((log) => {
        counts[log.habitId] = (counts[log.habitId] ?? 0) + log.metricValue;
      });
      setLogCounts(counts);
    };
    load();
  }, []);

  const habits = context?.habits ?? [];
  const habitLabel = (habitId: number | null) =>
    habits.find((h: Habit) => h.id === habitId)?.name ?? 'All habits';

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Targets</Text>
      <Button title="Add Target" onPress={() => router.push('/targets/add')} />
      <View style={{ marginTop: 12, gap: 10 }}>
        {targets.map((target) => {
          const current = target.habitId ? logCounts[target.habitId] ?? 0 : 0;
          return (
            <Pressable
              key={target.id}
              onPress={() => router.push({ pathname: '/targets/[id]/edit', params: { id: target.id.toString() } })}
              style={{ borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: 10 }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                {habitLabel(target.habitId)}
              </Text>
              <Text>Period: {target.periodType}</Text>
              <Text>Target: {target.targetValue}</Text>
              <Text>Progress: {current}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
