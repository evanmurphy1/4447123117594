// 09/04/26: Renders monthly progress cards for habits.
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

// 09/04/26: Defines props for monthly view component.
type MonthlyViewNewProps = {
  habits: Habit[];
  logs: HabitLogRow[];
};

// 16/04/26: Month key helper.
const monthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// 16/04/26: Monthly counts from logs.
export default function MonthlyViewNew({ habits, logs }: MonthlyViewNewProps) {
  const context = useContext(HabitContext);
  const theme = context?.theme;
  const currentMonth = monthKey();

  // 16/04/26: Monthly total metric sum.
  const totalThisMonth = (habitId: number) => {
    let total = 0;
    logs.forEach((log) => {
      if (log.habitId !== habitId) return;
      if (log.metricValue <= 0) return;
      if (!log.logDate.startsWith(currentMonth)) return;
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
            This month: {totalThisMonth(habit.id)} total
          </Text>
        </View>
      ))}
    </View>
  );
}

// 13/04/26: Harmonizes monthly text colors.
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
