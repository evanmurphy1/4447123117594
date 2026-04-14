// 11/04/26: Lists targets with progress summary.
import { desc } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Targets</Text>
      {/* 13/04/26: Consistent dark primary action. */}
      <Pressable style={styles.primaryButton} onPress={() => router.push('/targets/add')}>
        <Text style={styles.primaryButtonText}>Add Target</Text>
      </Pressable>
      {/* 14/04/26: Scroll long target entries. */}
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 120 }}>
        {targets.map((target) => {
          const current = target.habitId ? logCounts[target.habitId] ?? 0 : 0;
          return (
            <Pressable
              key={target.id}
              onPress={() => router.push({ pathname: '/targets/[id]/edit', params: { id: target.id.toString() } })}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{habitLabel(target.habitId)}</Text>
              <Text style={styles.cardMeta}>Period: {target.periodType}</Text>
              <Text style={styles.cardMeta}>Target: {target.targetValue}</Text>
              <Text style={styles.cardMeta}>Progress: {current}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// 13/04/26: Dark themed styles for targets.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#171717',
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    color: '#3b82f6',
    fontWeight: '600',
  },
  list: {
    marginTop: 12,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#262626',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  cardMeta: {
    color: '#9ca3af',
    marginTop: 2,
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
