// 09/04/26: Renders monthly progress cards for habits.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Habit } from '@/app/_layout';

// 09/04/26: Defines props for monthly view component.
type MonthlyViewNewProps = {
  habits: Habit[];
};

// 09/04/26: Displays monthly placeholder completion data.
export default function MonthlyViewNew({ habits }: MonthlyViewNewProps) {
  return (
    <View style={styles.container}>
      {habits.map((habit) => (
        <View key={habit.id} style={styles.card}>
          <Text style={styles.name}>{habit.name}</Text>
          <Text style={styles.meta}>This month: 0 days completed</Text>
        </View>
      ))}
    </View>
  );
}

// 09/04/26: Styles monthly section for dark design.
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
