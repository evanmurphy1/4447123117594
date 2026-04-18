//08/04/26 changed for habits
import { useFocusEffect } from '@react-navigation/native';
import { and, eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
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
import { fetchMotivationalQuote } from '@/services/quotes';
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
  const [quote, setQuote] = useState<string>('');
  const [quoteAuthor, setQuoteAuthor] = useState<string>('');
  const [quoteLoading, setQuoteLoading] = useState<boolean>(true);
  const [quoteError, setQuoteError] = useState<string>('');
  // 09/04/26: Reads habits safely before context guard.
  const habits = context?.habits ?? EMPTY_HABITS;
  const user = context?.user ?? null;
  const theme = context?.theme;
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

  // 18/04/26: Load quote on home.
  const loadQuote = useCallback(async () => {
    setQuoteLoading(true);
    setQuoteError('');
    try {
      const result = await fetchMotivationalQuote();
      setQuote(result.text);
      setQuoteAuthor(result.author);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : 'Unable to load quote');
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

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
    <View style={[styles.screen, theme ? { backgroundColor: theme.background } : null]}>
      <View style={[styles.bgWash, theme ? { backgroundColor: theme.wash } : null]} />
      <View style={[styles.bgStripe, theme ? { backgroundColor: theme.stripe } : null]} />
      <SafeAreaView style={styles.container}>
        <HomeHeaderNew onAddPress={() => router.push({ pathname: '../add' })} />
        <View style={[styles.quoteCard, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}>
        {quoteLoading ? (
            <Text style={[styles.quoteMeta, theme ? { color: theme.textMuted } : null]}>Loading quote...</Text>
        ) : quoteError ? (
          <>
            <Text style={styles.quoteError}>Quote unavailable</Text>
            <Pressable style={styles.linkButton} onPress={loadQuote}>
                <Text style={[styles.linkButtonText, theme ? { color: theme.text } : null]}>Retry</Text>
            </Pressable>
          </>
        ) : (
          <>
              <Text style={[styles.quoteText, theme ? { color: theme.text } : null]}>{`\u201C${quote}\u201D`}</Text>
              <Text style={[styles.quoteMeta, theme ? { color: theme.textMuted } : null]}>- {quoteAuthor}</Text>
            <Pressable style={styles.linkButton} onPress={loadQuote}>
                <Text style={[styles.linkButtonText, theme ? { color: theme.text } : null]}>New Quote</Text>
            </Pressable>
          </>
        )}
        </View>

        <View style={styles.navRow}>
          <Pressable
            style={[styles.navLink, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
            onPress={() => router.push('/categories')}
          >
            <Text style={[styles.navText, theme ? { color: theme.text } : null]}>Categories</Text>
        </Pressable>
          <Pressable
            style={[styles.navLink, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
            onPress={() => router.push('/logs')}
          >
            <Text style={[styles.navText, theme ? { color: theme.text } : null]}>Logs</Text>
        </Pressable>
          <Pressable
            style={[styles.navLink, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
            onPress={() => router.push('/targets')}
          >
            <Text style={[styles.navText, theme ? { color: theme.text } : null]}>Targets</Text>
        </Pressable>
          <Pressable
            style={[styles.navLink, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
            onPress={() => router.push('/insights')}
          >
            <Text style={[styles.navText, theme ? { color: theme.text } : null]}>Insights</Text>
        </Pressable>
        {user ? (
            <Pressable
              style={[styles.navLink, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
              onPress={() => router.push('/account')}
            >
              <Text style={[styles.navText, theme ? { color: theme.text } : null]}>Account</Text>
          </Pressable>
        ) : (
          <>
              <Pressable
                style={[styles.navLink, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
                onPress={() => router.push('/auth/login')}
              >
                <Text style={[styles.navText, theme ? { color: theme.text } : null]}>Login</Text>
            </Pressable>
              <Pressable
                style={[styles.navLink, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
                onPress={() => router.push('/auth/register')}
              >
                <Text style={[styles.navText, theme ? { color: theme.text } : null]}>Register</Text>
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
            <Pressable
              style={[styles.primaryButton, theme ? { borderColor: theme.buttonBorder, backgroundColor: theme.buttonBg } : null]}
              onPress={() => router.push({ pathname: '../add' })}
            >
              <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Add Habit</Text>
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
    marginBottom: 12,
  },
  navLink: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  navText: {
    color: '#e5e7eb',
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
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },
  quoteCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    marginBottom: 12,
    gap: 6,
  },
  quoteText: {
    color: '#e5e7eb',
    fontSize: 14,
    lineHeight: 20,
  },
  quoteMeta: {
    color: '#9ca3af',
    fontSize: 13,
  },
  quoteError: {
    color: '#fca5a5',
    fontSize: 13,
  },
  linkButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  linkButtonText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '600',
  },
});
