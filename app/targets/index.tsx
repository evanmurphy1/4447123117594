// 11/04/26: Lists targets with progress summary.
import { desc, eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

type HabitLogRow = {
  id: number;
  habitId: number;
  categoryId: number;
  logDate: string;
  metricValue: number;
  notes: string | null;
};

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 16/04/26: Current week range.
const getWeekRange = () => {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toIsoDate(start), end: toIsoDate(end) };
};

// 16/04/26: Current month key.
const getMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// 11/04/26: Renders targets list screen.
export default function TargetsIndex() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const theme = context?.theme;
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [logs, setLogs] = useState<HabitLogRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        const userId = context?.user?.id;
        if (!userId) return;
        const rows = await db
          .select()
          .from(targetsTable)
          .where(eq(targetsTable.userId, userId))
          .orderBy(desc(targetsTable.id));
        const logRows = await db.select().from(habitLogsTable).where(eq(habitLogsTable.userId, userId));
        if (!active) return;
        setTargets(rows as TargetRow[]);
        setLogs(logRows as HabitLogRow[]);
      };

      load();

      return () => {
        active = false;
      };
    }, [context?.user?.id])
  );

  const habits = context?.habits ?? [];
  const habitLabel = (habitId: number | null) =>
    habits.find((h: Habit) => h.id === habitId)?.name ?? 'All habits';

  // 16/04/26: Progress by target period.
  const progressForTarget = (target: TargetRow) => {
    const week = getWeekRange();
    const monthKey = getMonthKey();

    return logs
      .filter((log) => {
        if (target.habitId !== null && log.habitId !== target.habitId) return false;
        if (target.categoryId !== null && log.categoryId !== target.categoryId) return false;
        if (target.periodType === 'weekly') {
          return log.logDate >= week.start && log.logDate <= week.end;
        }
        if (target.periodType === 'monthly') {
          return log.logDate.startsWith(monthKey);
        }
        return true;
      })
      .reduce((sum, log) => sum + Math.max(0, log.metricValue), 0);
  };

  // 16/04/26: Status text from progress.
  const statusFor = (current: number, targetValue: number) => {
    if (current > targetValue) return 'Exceeded';
    if (current === targetValue) return 'Met';
    return 'Unmet';
  };

  return (
    <View style={[styles.screen, theme ? { backgroundColor: theme.background } : null]}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={[styles.bgWash, theme ? { backgroundColor: theme.wash } : null]} />
      <View style={[styles.bgStripe, theme ? { backgroundColor: theme.stripe } : null]} />
      <SafeAreaView style={styles.container}>
        <Pressable
          style={[
            styles.backButton,
            theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null,
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, theme ? { color: theme.text } : null]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, theme ? { color: theme.text } : null]}>Targets</Text>
        {/* 13/04/26: Consistent dark primary action. */}
        <Pressable
          style={[
            styles.primaryButton,
            theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
          ]}
          onPress={() => router.push('/targets/add')}
        >
          <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Add Target</Text>
        </Pressable>
        {/* 14/04/26: Scroll long target entries. */}
        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 120 }}>
          {targets.map((target) => {
            const current = progressForTarget(target);
            const remaining = Math.max(0, target.targetValue - current);
            const fillRatio = target.targetValue > 0 ? Math.min(1, current / target.targetValue) : 0;
            const fillWidth = `${fillRatio * 100}%`;
            const status = statusFor(current, target.targetValue);
            return (
              <Pressable
                key={target.id}
                onPress={() => router.push({ pathname: '/targets/[id]/edit', params: { id: target.id.toString() } })}
                style={[styles.card, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
              >
                <Text style={[styles.cardTitle, theme ? { color: theme.text } : null]}>{habitLabel(target.habitId)}</Text>
                <Text style={[styles.cardMeta, theme ? { color: theme.textMuted } : null]}>Period: {target.periodType}</Text>
                <Text style={[styles.cardMeta, theme ? { color: theme.textMuted } : null]}>Target: {target.targetValue}</Text>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressSide, theme ? { color: theme.text } : null]}>{current}</Text>
                  <Text style={[styles.progressSide, theme ? { color: theme.textMuted } : null]}>{remaining}</Text>
                </View>
                <View style={[styles.progressTrack, theme ? { borderColor: theme.border } : null]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: fillWidth },
                      status === 'Exceeded'
                        ? { backgroundColor: '#60a5fa' }
                        : status === 'Met'
                          ? { backgroundColor: '#34d399' }
                          : { backgroundColor: '#2dd4bf' },
                    ]}
                  />
                </View>
                <Text style={[styles.cardMeta, theme ? { color: theme.textMuted } : null]}>
                  {Math.min(current, target.targetValue)}/{target.targetValue}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// 13/04/26: Dark themed styles for targets.
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
    backgroundColor: 'rgba(45, 212, 191, 0.14)',
    top: 40,
    right: -140,
    transform: [{ rotate: '-16deg' }],
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    color: '#f8fafc',
    fontWeight: '600',
  },
  list: {
    marginTop: 12,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  cardMeta: {
    color: '#cbd5e1',
    marginTop: 2,
  },
  progressRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSide: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    marginTop: 6,
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2dd4bf',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.32)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
});
