// 09/04/26: Renders today habits list in cards.
import React, { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HabitContext } from '@/app/_layout';
import type { Habit } from '@/app/_layout';

// 09/04/26: Defines props for today view actions.
type TodayViewNewProps = {
  habits: Habit[];
  doneHabitIds?: number[];
  streaks?: Record<number, number>;
  onHabitPress?: (habit: Habit) => void;
  onTogglePress?: (habit: Habit) => void;
};

// 09/04/26: Displays habits with icon and toggle.
export default function TodayViewNew({
  habits,
  doneHabitIds = [],
  streaks = {},
  onHabitPress,
  onTogglePress,
}: TodayViewNewProps) {
  const context = useContext(HabitContext);
  const theme = context?.theme;

  return (
    <View style={styles.container}>
      {habits.map((habit) => (
        <View
          key={habit.id}
          style={[styles.card, theme ? { backgroundColor: theme.panel, borderColor: theme.border } : null]}
        >
          <Pressable style={styles.left} onPress={() => onHabitPress?.(habit)}>
            <View style={styles.textWrap}>
              <Text style={[styles.name, theme ? { color: theme.text } : null]}>{habit.name}</Text>
              {(streaks[habit.id] ?? 0) > 0 ? (
                <Text style={[styles.meta, theme ? { color: theme.textMuted } : null]}>
                  {streaks[habit.id]} day streak
                </Text>
              ) : null}
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.toggle,
              doneHabitIds.includes(habit.id) ? styles.toggleActive : null,
              theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
            ]}
            onPress={() => onTogglePress?.(habit)}
          >
            {/* 15/04/26: Done status label. */}
            <Text style={[styles.toggleText, theme ? { color: theme.text } : null]}>
              {doneHabitIds.includes(habit.id) ? 'Done ✓' : 'Done'}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

// 13/04/26: Uses muted text for cards.
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textWrap: {
    flex: 1,
  },
  name: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '600',
  },
  meta: {
    color: '#cbd5e1',
    marginTop: 2,
  },
  toggle: {
    minWidth: 56,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  toggleActive: {
    backgroundColor: 'rgba(34,197,94,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(134,239,172,0.8)',
  },
  toggleText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
});
