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
const todayIso = () => new Date().toISOString().slice(0, 10);

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);
  // 09/04/26: Tracks currently selected habits filter tab.
  const [activeTab, setActiveTab] = useState<(typeof FILTERS)[number]>('Today');
  const [doneHabitIds, setDoneHabitIds] = useState<number[]>([]);
  // 09/04/26: Reads habits safely before context guard.
  const habits = context?.habits ?? [];
  const user = context?.user ?? null;
  // 09/04/26: Keeps today list until other views added.
  const visibleHabits = habits;
  // 09/04/26: Shows empty state when no habits.
  const isEmpty = visibleHabits.length === 0;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadDoneHabits = async () => {
        const rows = await db
          .select()
          .from(habitLogsTable)
          .where(eq(habitLogsTable.logDate, todayIso()));
        if (!active) return;
        setDoneHabitIds(rows.map((row) => row.habitId));
      };

      loadDoneHabits();

      return () => {
        active = false;
      };
    }, [])
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
      setDoneHabitIds((prev) => prev.filter((id) => id !== habit.id));
      return;
    }

    await db.insert(habitLogsTable).values({
      habitId: habit.id,
      categoryId: habit.categoryId,
      logDate: todayIso(),
      metricValue: 1,
      notes: 'Done',
    });
    setDoneHabitIds((prev) => (prev.includes(habit.id) ? prev : [...prev, habit.id]));
  };

  if (!context) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#171717', padding: 20 }}>
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
                onHabitPress={(habit) =>
                  router.push({ pathname: '/habit/[id]', params: { id: habit.id.toString() } })
                }
                onTogglePress={toggleHabitDone}
              />
            ) : activeTab === 'Weekly' ? (
              <WeeklyViewNew habits={visibleHabits} />
            ) : activeTab === 'Monthly' ? (
              <MonthlyViewNew habits={visibleHabits} />
            ) : activeTab === 'Overall' ? (
              <OverallViewNew habits={visibleHabits} />
            ) : (
              visibleHabits.map((habit: Habit) => <HabitCard key={habit.id} habit={habit} />)
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

// 13/04/26: Dark themed styles for home.
const styles = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  navLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  navText: {
    color: '#3b82f6',
    fontSize: 16,
  },
  primaryButton: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  primaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});
