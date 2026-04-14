// 12/04/26: Shows insights with simple chart.
import { desc, gte } from 'drizzle-orm';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { db } from '@/db/client';
import { habitLogsTable } from '@/db/schema';

// 12/04/26: Defines log row shape.
type HabitLogRow = {
  id: number;
  logDate: string;
  metricValue: number;
};

// 12/04/26: Formats date to YYYY-MM-DD.
const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

// 12/04/26: Builds last N days list.
const lastNDays = (n: number) => {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const copy = new Date(today);
    copy.setDate(today.getDate() - (n - 1 - i));
    return toIsoDate(copy);
  });
};

// 12/04/26: Renders insights screen.
export default function InsightsIndex() {
  const router = useRouter();
  const [logs, setLogs] = useState<HabitLogRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const dates = lastNDays(7);
      const start = dates[0];
      const rows = await db
        .select()
        .from(habitLogsTable)
        .where(gte(habitLogsTable.logDate, start))
        .orderBy(desc(habitLogsTable.logDate));
      setLogs(rows as HabitLogRow[]);
    };
    load();
  }, []);

  // 12/04/26: Aggregates daily totals for chart.
  const chartData = useMemo(() => {
    const days = lastNDays(7);
    const totals: Record<string, number> = {};
    days.forEach((d) => {
      totals[d] = 0;
    });
    logs.forEach((log) => {
      if (totals[log.logDate] !== undefined) {
        totals[log.logDate] += log.metricValue;
      }
    });
    return days.map((d) => ({ date: d, total: totals[d] }));
  }, [logs]);

  const max = Math.max(1, ...chartData.map((d) => d.total));

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>Last 7 days total activity</Text>

      <View style={styles.chartRow}>
        {chartData.map((item) => (
          <View key={item.date} style={styles.chartItem}>
            <View
              style={{
                width: '100%',
                height: Math.max(6, (item.total / max) * 140),
                backgroundColor: '#2f2f2f',
                borderRadius: 6,
              }}
            />
            <Text style={styles.chartLabel}>{item.date.slice(5)}</Text>
            <Text style={styles.chartValue}>{item.total}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

// 13/04/26: Dark themed styles for insights.
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
  subtitle: {
    marginBottom: 16,
    color: '#9ca3af',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 180,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartLabel: {
    fontSize: 10,
    marginTop: 6,
    color: '#9ca3af',
  },
  chartValue: {
    fontSize: 10,
    color: '#6b7280',
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600',
  },
});
