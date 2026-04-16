// 11/04/26: Adds weekly or monthly targets.
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { targetsTable } from '@/db/schema';
import { Habit, HabitContext } from '../_layout';

// 11/04/26: Renders add target form.
export default function AddTarget() {
  const router = useRouter();
  const context = useContext(HabitContext);

  const habits = context?.habits ?? [];
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('weekly');
  const [targetValue, setTargetValue] = useState('5');
  const [habitId, setHabitId] = useState<number | null>(habits[0]?.id ?? null);

  const saveTarget = async () => {
    const value = Number(targetValue);
    if (!Number.isFinite(value) || value <= 0) return;

    await db.insert(targetsTable).values({
      periodType,
      targetValue: value,
      habitId,
      categoryId: null,
    });

    router.back();
  };

  return (
    <View style={styles.screen}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={styles.bgWash} />
      <View style={styles.bgStripe} />
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Add Target</Text>

        <Text style={styles.label}>Period</Text>
        <View style={styles.row}>
          <Pressable onPress={() => setPeriodType('weekly')}>
            <Text style={{ color: periodType === 'weekly' ? '#f8fafc' : '#cbd5e1' }}>Weekly</Text>
          </Pressable>
          <Pressable onPress={() => setPeriodType('monthly')}>
            <Text style={{ color: periodType === 'monthly' ? '#f8fafc' : '#cbd5e1' }}>Monthly</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Habit (optional)</Text>
        <View style={styles.chipRow}>
          <Pressable
            onPress={() => setHabitId(null)}
            style={{
              ...styles.chip,
              borderColor: habitId === null ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.22)',
              backgroundColor: habitId === null ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
            }}
          >
            <Text style={styles.chipText}>All Habits</Text>
          </Pressable>
          {habits.map((habit: Habit) => (
            <Pressable
              key={habit.id}
              onPress={() => setHabitId(habit.id)}
              style={{
                ...styles.chip,
                borderColor: habitId === habit.id ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.22)',
                backgroundColor: habitId === habit.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              }}
            >
              <Text style={styles.chipText}>{habit.name}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Target value"
          placeholderTextColor="#cbd5e1"
          value={targetValue}
          onChangeText={setTargetValue}
          keyboardType="numeric"
        />
        {/* 13/04/26: Consistent dark primary action. */}
        <Pressable style={styles.primaryButton} onPress={saveTarget}>
          <Text style={styles.primaryButtonText}>Save Target</Text>
        </Pressable>
      </View>
    </View>
  );
}

// 13/04/26: Dark themed styles for targets.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1224',
  },
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
    flex: 1,
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
    width: 540,
    height: 220,
    backgroundColor: 'rgba(45, 212, 191, 0.14)',
    top: 20,
    right: -150,
    transform: [{ rotate: '-16deg' }],
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    color: '#f8fafc',
    fontWeight: '600',
  },
  label: {
    marginBottom: 6,
    color: '#cbd5e1',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    color: '#f8fafc',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.34)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
});
