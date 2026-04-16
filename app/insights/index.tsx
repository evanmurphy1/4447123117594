// 12/04/26: Shows insights with simple chart.
import { desc, gte } from 'drizzle-orm';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
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

// 16/04/26: Insights view modes.
type InsightMode = 'daily' | 'weekly' | 'monthly';

// 12/04/26: Builds last N days list.
const lastNDays = (n: number) => {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const copy = new Date(today);
    copy.setDate(today.getDate() - (n - 1 - i));
    return toIsoDate(copy);
  });
};

// 16/04/26: Recent week starts list.
const lastNWeekStarts = (n: number) => {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - mondayOffset);
  return Array.from({ length: n }, (_, i) => {
    const copy = new Date(thisMonday);
    copy.setDate(thisMonday.getDate() - (n - 1 - i) * 7);
    return toIsoDate(copy);
  });
};

// 16/04/26: Recent month keys list.
const lastNMonths = (n: number) => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const copy = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    const year = copy.getFullYear();
    const month = String(copy.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
};

// 16/04/26: Week start for date.
const weekStartFor = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return toIsoDate(date);
};

// 12/04/26: Renders insights screen.
export default function InsightsIndex() {
  const router = useRouter();
  const [logs, setLogs] = useState<HabitLogRow[]>([]);
  const [mode, setMode] = useState<InsightMode>('daily');

  useEffect(() => {
    const load = async () => {
      // 16/04/26: Load range for all modes.
      const dayStart = lastNDays(14)[0];
      const weekStart = lastNWeekStarts(8)[0];
      const monthStart = `${lastNMonths(6)[0]}-01`;
      const start = [dayStart, weekStart, monthStart].sort()[0];
      const rows = await db
        .select()
        .from(habitLogsTable)
        .where(gte(habitLogsTable.logDate, start))
        .orderBy(desc(habitLogsTable.logDate));
      setLogs(rows as HabitLogRow[]);
    };
    load();
  }, []);

  // 16/04/26: Aggregates chart by mode.
  const chartData = useMemo(() => {
    if (mode === 'daily') {
      const keys = lastNDays(7);
      const totals: Record<string, number> = {};
      keys.forEach((k) => {
        totals[k] = 0;
      });
      logs.forEach((log) => {
        if (totals[log.logDate] !== undefined) {
          totals[log.logDate] += log.metricValue;
        }
      });
      return keys.map((k) => ({
        key: k,
        label: k.slice(5),
        total: totals[k],
      }));
    }

    if (mode === 'weekly') {
      const keys = lastNWeekStarts(6);
      const totals: Record<string, number> = {};
      keys.forEach((k) => {
        totals[k] = 0;
      });
      logs.forEach((log) => {
        const wk = weekStartFor(log.logDate);
        if (totals[wk] !== undefined) {
          totals[wk] += log.metricValue;
        }
      });
      return keys.map((k) => ({
        key: k,
        label: `Wk ${k.slice(5)}`,
        total: totals[k],
      }));
    }

    const keys = lastNMonths(6);
    const totals: Record<string, number> = {};
    keys.forEach((k) => {
      totals[k] = 0;
    });
    logs.forEach((log) => {
      const mk = log.logDate.slice(0, 7);
      if (totals[mk] !== undefined) {
        totals[mk] += log.metricValue;
      }
    });
    return keys.map((k) => ({
      key: k,
      label: k.slice(2),
      total: totals[k],
    }));
  }, [logs, mode]);

  const max = Math.max(1, ...chartData.map((d) => d.total));
  const total = chartData.reduce((sum, item) => sum + item.total, 0);

  const subtitle =
    mode === 'daily'
      ? 'Last 7 days total activity'
      : mode === 'weekly'
        ? 'Last 6 weeks total activity'
        : 'Last 6 months total activity';

  const modeChip = (value: InsightMode): ViewStyle[] => [
    styles.modeChip,
    mode === value ? styles.modeChipActive : styles.modeChipInactive,
  ];

  return (
    <View style={styles.screen}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={styles.bgWash} />
      <View style={styles.bgStripe} />
      <SafeAreaView style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.subtitle}>Total: {total}</Text>

        <View style={styles.modeRow}>
          <Pressable style={modeChip('daily')} onPress={() => setMode('daily')}>
            <Text style={styles.modeText}>Daily</Text>
          </Pressable>
          <Pressable style={modeChip('weekly')} onPress={() => setMode('weekly')}>
            <Text style={styles.modeText}>Weekly</Text>
          </Pressable>
          <Pressable style={modeChip('monthly')} onPress={() => setMode('monthly')}>
            <Text style={styles.modeText}>Monthly</Text>
          </Pressable>
        </View>

        <View style={styles.chartRow}>
          {chartData.map((item) => (
            <View key={item.key} style={styles.chartItem}>
              <View
                style={{
                  width: '100%',
                  height: Math.max(6, (item.total / max) * 140),
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  borderRadius: 8,
                }}
              />
              <Text style={styles.chartLabel}>{item.label}</Text>
              <Text style={styles.chartValue}>{item.total}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

// 13/04/26: Dark themed styles for insights.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090f1f',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  bgWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 41, 59, 0.25)',
  },
  bgStripe: {
    position: 'absolute',
    width: 560,
    height: 220,
    backgroundColor: 'rgba(167, 139, 250, 0.14)',
    top: 40,
    right: -150,
    transform: [{ rotate: '-18deg' }],
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    color: '#f8fafc',
    fontWeight: '600',
  },
  subtitle: {
    color: '#cbd5e1',
    marginBottom: 6,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  modeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modeChipActive: {
    borderColor: 'rgba(255,255,255,0.36)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  modeChipInactive: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modeText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  chartRow: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 12,
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
    color: '#cbd5e1',
  },
  chartValue: {
    fontSize: 10,
    color: '#e2e8f0',
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
});
