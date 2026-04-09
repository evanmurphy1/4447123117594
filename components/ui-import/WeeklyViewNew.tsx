// 09/04/26: Renders weekly habits progress summary cards.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Habit } from '@/app/_layout';

// 09/04/26: Defines props for weekly view component.
type WeeklyViewNewProps = {
  habits: Habit[];
};

// 09/04/26: Displays weekly placeholder metrics per habit.
export default function WeeklyViewNew({ habits }: WeeklyViewNewProps) {
  return (
    <View style={styles.container}>
      {habits.map((habit) => (
        <View key={habit.id} style={styles.card}>
          <Text style={styles.name}>{habit.name}</Text>
          <Text style={styles.meta}>This week: 0 / 7 tracked</Text>
        </View>
      ))}
    </View>
  );
}

// 09/04/26: Styles weekly list cards with spacing.
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
  },
  name: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  meta: {
    color: '#a3a3a3',
    marginTop: 4,
  },
});
