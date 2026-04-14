// 09/04/26: Renders today habits list in cards.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Habit } from '@/app/_layout';

// 09/04/26: Defines props for today view actions.
type TodayViewNewProps = {
  habits: Habit[];
  onHabitPress?: (habit: Habit) => void;
  onTogglePress?: (habit: Habit) => void;
};

// 09/04/26: Displays habits with icon and toggle.
export default function TodayViewNew({ habits, onHabitPress, onTogglePress }: TodayViewNewProps) {
  return (
    <View style={styles.container}>
      {habits.map((habit) => (
        <View key={habit.id} style={styles.card}>
          <Pressable style={styles.left} onPress={() => onHabitPress?.(habit)}>
            <View style={styles.textWrap}>
              <Text style={styles.name}>{habit.name}</Text>
              <Text style={styles.meta}>{habit.metricType}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.toggle} onPress={() => onTogglePress?.(habit)}>
            <Text style={styles.toggleText}>Done</Text>
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
    backgroundColor: '#262626',
    borderColor: '#3f3f46',
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
    color: '#e5e7eb',
    fontSize: 17,
    fontWeight: '600',
  },
  meta: {
    color: '#9ca3af',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  toggle: {
    minWidth: 56,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  toggleText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
});
