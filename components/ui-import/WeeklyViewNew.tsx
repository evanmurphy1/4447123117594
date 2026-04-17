// 09/04/26: Renders weekly habits progress summary cards.
import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Habit } from '@/app/_layout';
import { HabitContext } from '@/app/_layout';

type HabitLogRow = {
  id: number;
  habitId: number;
  categoryId: number;
  logDate: string;
  metricValue: number;
  notes: string | null;
};

// 09/04/26: Defines props for weekly view component.
type WeeklyViewNewProps = {
  habits: Habit[];
  logs: HabitLogRow[];
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

// 16/04/26: Current week range.
const getWeekRange = () => {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return { start: toIsoDate(weekStart), end: toIsoDate(weekEnd) };
};

// 16/04/26: Weekly counts from logs.
export default function WeeklyViewNew({ habits, logs }: WeeklyViewNewProps) {
  const context = useContext(HabitContext);
  const theme = context?.theme;
  const { start, end } = getWeekRange();

  // 16/04/26: Weekly total metric sum.
  const totalThisWeek = (habitId: number) => {
    let total = 0;
    logs.forEach((log) => {
      if (log.habitId !== habitId) return;
      if (log.metricValue <= 0) return;
      if (log.logDate < start || log.logDate > end) return;
      total += log.metricValue;
    });
    return total;
  };

  return (
    <View style={styles.container}>
      {habits.map((habit) => (
        <View
          key={habit.id}
          style={[styles.card, theme ? { backgroundColor: theme.panel, borderColor: theme.border } : null]}
        >
          <Text style={[styles.name, theme ? { color: theme.text } : null]}>{habit.name}</Text>
          <Text style={[styles.meta, theme ? { color: theme.textMuted } : null]}>
            This week: {totalThisWeek(habit.id)} total
          </Text>
        </View>
      ))}
    </View>
  );
}

// 13/04/26: Uses muted tones for consistency.
const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  name: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '600',
  },
  meta: {
    color: '#cbd5e1',
    marginTop: 4,
  },
});
