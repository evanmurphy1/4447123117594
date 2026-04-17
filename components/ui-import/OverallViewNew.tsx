// 09/04/26: Renders overall habit consistency overview cards.
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

// 09/04/26: Defines props for overall view component.
type OverallViewNewProps = {
  habits: Habit[];
  logs: HabitLogRow[];
  streaks: Record<number, number>;
};

// 16/04/26: Current month key.
const monthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// 16/04/26: Monthly trend bucket text.
const trendLabel = (total: number) => {
  if (total <= 5) return '0-5: getting started';
  if (total <= 15) return '5-15: steady progress';
  if (total <= 20) return '15-20: strong routine';
  if (total <= 25) return '20-25: excellent consistency';
  return '25-30: top consistency';
};

// 16/04/26: Displays monthly trend buckets.
export default function OverallViewNew({ habits, logs, streaks }: OverallViewNewProps) {
  const context = useContext(HabitContext);
  const theme = context?.theme;
  const currentMonth = monthKey();

  const monthlyTotal = (habitId: number) => {
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
      {habits.map((habit) => {
        const total = monthlyTotal(habit.id);
        return (
          <View
            key={habit.id}
            style={[styles.card, theme ? { backgroundColor: theme.panel, borderColor: theme.border } : null]}
          >
            <Text style={[styles.name, theme ? { color: theme.text } : null]}>{habit.name}</Text>
            <Text style={[styles.meta, theme ? { color: theme.textMuted } : null]}>
              Overall trend: {trendLabel(total)}
            </Text>
            <Text style={[styles.meta, theme ? { color: theme.textMuted } : null]}>This month total: {total}</Text>
            <Text style={[styles.meta, theme ? { color: theme.textMuted } : null]}>
              {streaks[habit.id] ?? 0} day streak
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// 13/04/26: Applies unified neutral text colors.
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
