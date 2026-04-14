// 09/04/26: Renders overall habit consistency overview cards.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Habit } from '@/app/_layout';

// 09/04/26: Defines props for overall view component.
type OverallViewNewProps = {
  habits: Habit[];
};

// 09/04/26: Displays all-time placeholder trend information.
export default function OverallViewNew({ habits }: OverallViewNewProps) {
  return (
    <View style={styles.container}>
      {habits.map((habit) => (
        <View key={habit.id} style={styles.card}>
          <Text style={styles.name}>{habit.name}</Text>
          <Text style={styles.meta}>Overall trend: getting started</Text>
        </View>
      ))}
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
    backgroundColor: '#262626',
    borderColor: '#3f3f46',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  name: {
    color: '#e5e7eb',
    fontSize: 17,
    fontWeight: '600',
  },
  meta: {
    color: '#9ca3af',
    marginTop: 4,
  },
});
