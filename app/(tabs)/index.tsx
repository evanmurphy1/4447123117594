//08/04/26 changed for habits
import { and, eq } from 'drizzle-orm';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HabitCard from '@/components/HabitCard';
import EmptyViewNew from '@/components/ui-import/EmptyViewNew';
import HabitTabsNew from '@/components/ui-import/HabitTabsNew';
import HomeHeaderNew from '@/components/ui-import/HomeHeaderNew';
import MonthlyViewNew from '@/components/ui-import/MonthlyViewNew';
import OverallViewNew from '@/components/ui-import/OverallViewNew';
import TodayViewNew from '@/components/ui-import/TodayViewNew';
import WeeklyViewNew from '@/components/ui-import/WeeklyViewNew';
import { db } from '@/db/client';
import { habitLogsTable } from '@/db/schema';
import { Habit, HabitContext } from '../_layout';

// 09/04/26: Defines top filters for habits screen.
const FILTERS = ['Today', 'Weekly', 'Monthly', 'Overall'] as const;
const EMPTY_HABITS: Habit[] = [];
const todayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseIsoDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const shiftIsoDate = (value: string, days: number) => {
  const base = parseIsoDate(value);
  base.setDate(base.getDate() + days);
  return toIsoDate(base);
};

type HabitLogRow = {
  id: number;
  habitId: number;
  categoryId: number;
  logDate: string;
  metricValue: number;
  notes: string | null;
};

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);
  // 09/04/26: Tracks currently selected habits filter tab.
  const [activeTab, setActiveTab] = useState<(typeof FILTERS)[number]>('Today');
  const [doneHabitIds, setDoneHabitIds] = useState<number[]>([]);
  const [logs, setLogs] = useState<HabitLogRow[]>([]);
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  // 09/04/26: Reads habits safely before context guard.
  const habits = context?.habits ?? EMPTY_HABITS;
  const user = context?.user ?? null;
  // 09/04/26: Keeps today list until other views added.
  const visibleHabits = habits;
  // 09/04/26: Shows empty state when no habits.
  const isEmpty = visibleHabits.length === 0;

  // 16/04/26: Load logs from db.
  const loadLogs = useCallback(async () => {
    const rows = await db.select().from(habitLogsTable);
    const logRows = rows as HabitLogRow[];
    setLogs(logRows);
    const todayHabitIds = logRows.filter((row) => row.logDate === todayIso()).map((row) => row.habitId);
    setDoneHabitIds(todayHabitIds);

    // 16/04/26: Calculate current streaks.
    const logsByHabit = new Map<number, Set<string>>();
    logRows.forEach((row) => {
      if (row.metricValue <= 0) return;
      const set = logsByHabit.get(row.habitId) ?? new Set<string>();
      set.add(row.logDate);
      logsByHabit.set(row.habitId, set);
    });

    const today = todayIso();
    const nextStreaks: Record<number, number> = {};
    habits.forEach((habit) => {
      const days = logsByHabit.get(habit.id) ?? new Set<string>();
      let streak = 0;
      let cursor = today;
      while (days.has(cursor)) {
        streak += 1;
        cursor = shiftIsoDate(cursor, -1);
      }
      nextStreaks[habit.id] = streak;
    });
    setStreaks(nextStreaks);
  }, [habits]);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  // 15/04/26: Toggle today completion.
  const toggleHabitDone = async (habit: Habit) => {
    const rows = await db
      .select()
      .from(habitLogsTable)
      .where(and(eq(habitLogsTable.habitId, habit.id), eq(habitLogsTable.logDate, todayIso())));

    if (rows.length > 0) {
      await db
        .delete(habitLogsTable)
        .where(and(eq(habitLogsTable.habitId, habit.id), eq(habitLogsTable.logDate, todayIso())));
      await loadLogs();
      return;
    }

    await db.insert(habitLogsTable).values({
      habitId: habit.id,
      categoryId: habit.categoryId,
      logDate: todayIso(),
      metricValue: 1,
      notes: 'Done',
    });
    await loadLogs();
  };

  if (!context) return null;

  return (
    <View style={styles.screen}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={styles.bgWash} />
      <View style={styles.bgStripe} />
      <SafeAreaView style={styles.container}>
        <HomeHeaderNew onAddPress={() => router.push({ pathname: '../add' })} />
        {/* 11/04/26: Adds quick navigation to management screens. */}
        <View style={styles.navRow}>
          <Pressable style={styles.navLink} onPress={() => router.push('/categories')}>
            <Text style={styles.navText}>Categories</Text>
          </Pressable>
          <Pressable style={styles.navLink} onPress={() => router.push('/logs')}>
            <Text style={styles.navText}>Logs</Text>
          </Pressable>
          <Pressable style={styles.navLink} onPress={() => router.push('/targets')}>
            <Text style={styles.navText}>Targets</Text>
          </Pressable>
          <Pressable style={styles.navLink} onPress={() => router.push('/insights')}>
            <Text style={styles.navText}>Insights</Text>
          </Pressable>
          {user ? (
            <Pressable style={styles.navLink} onPress={() => router.push('/account')}>
              <Text style={styles.navText}>Account</Text>
            </Pressable>
          ) : (
            <>
              <Pressable style={styles.navLink} onPress={() => router.push('/auth/login')}>
                <Text style={styles.navText}>Login</Text>
              </Pressable>
              <Pressable style={styles.navLink} onPress={() => router.push('/auth/register')}>
                <Text style={styles.navText}>Register</Text>
              </Pressable>
            </>
          )}
        </View>
        <HabitTabsNew filters={FILTERS} activeTab={activeTab} onChange={(tab) => setActiveTab(tab)} />

        {isEmpty ? (
          <EmptyViewNew onCreate={() => router.push({ pathname: '../add' })} />
        ) : (
          <View style={{ flex: 1 }}>
            {/* 13/04/26: Uses dark button for action. */}
            <Pressable style={styles.primaryButton} onPress={() => router.push({ pathname: '../add' })}>
              <Text style={styles.primaryButtonText}>Add Habit</Text>
            </Pressable>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12 }}>
              {activeTab === 'Today' ? (
                <TodayViewNew
                  habits={visibleHabits}
                  doneHabitIds={doneHabitIds}
                  streaks={streaks}
                  onHabitPress={(habit) =>
                    router.push({ pathname: '/habit/[id]', params: { id: habit.id.toString() } })
                  }
                  onTogglePress={toggleHabitDone}
                />
              ) : activeTab === 'Weekly' ? (
                <WeeklyViewNew habits={visibleHabits} logs={logs} />
              ) : activeTab === 'Monthly' ? (
                <MonthlyViewNew habits={visibleHabits} logs={logs} />
              ) : activeTab === 'Overall' ? (
                <OverallViewNew habits={visibleHabits} logs={logs} streaks={streaks} />
              ) : (
                visibleHabits.map((habit: Habit) => <HabitCard key={habit.id} habit={habit} />)
              )}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

// 13/04/26: Dark themed styles for home.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090f1f',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
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
    backgroundColor: 'rgba(125, 211, 252, 0.16)',
    top: 40,
    right: -150,
    transform: [{ rotate: '-18deg' }],
  },
  navRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  navText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
});
