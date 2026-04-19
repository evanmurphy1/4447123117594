// 11/04/26: Adds habit log with details.
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { habitLogsTable } from '@/db/schema';
import { Habit, HabitContext } from '../_layout';

// 11/04/26: Formats today as ISO date.
const todayIso = () => new Date().toISOString().slice(0, 10);

// 16/04/26: Parse iso to date.
const parseIsoDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
};

// 16/04/26: Date to iso string.
const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 16/04/26: Shift iso by days.
const shiftIsoDate = (value: string, days: number) => {
  const base = parseIsoDate(value);
  base.setDate(base.getDate() + days);
  return toIsoDate(base);
};

// 16/04/26: Readable date label.
const prettyDate = (value: string) =>
  parseIsoDate(value).toLocaleDateString('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// 11/04/26: Renders add log screen form.
export default function AddLog() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const theme = context?.theme;

  const habits = context?.habits ?? [];
  const [habitId, setHabitId] = useState<number>(habits[0]?.id ?? 0);
  const [logDate, setLogDate] = useState(todayIso());
  const [metricValue, setMetricValue] = useState('1');
  const [notes, setNotes] = useState('');

  // 11/04/26: Derives category from selected habit.
  const categoryId = habits.find((h: Habit) => h.id === habitId)?.categoryId ?? 0;

  const saveLog = async () => {
    const userId = context?.user?.id;
    if (!userId) return;
    const value = Number(metricValue);
    if (!habitId || !categoryId || !logDate.trim() || !Number.isFinite(value)) return;

    await db.insert(habitLogsTable).values({
      userId,
      habitId,
      categoryId,
      logDate: logDate.trim(),
      metricValue: value,
      notes: notes.trim() || null,
    });

    router.back();
  };

  return (
    <View style={[styles.screen, theme ? { backgroundColor: theme.background } : null]}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={[styles.bgWash, theme ? { backgroundColor: theme.wash } : null]} />
      <View style={[styles.bgStripe, theme ? { backgroundColor: theme.stripe } : null]} />
      <View style={styles.container}>
        <Pressable
          style={[
            styles.backButton,
            theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null,
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, theme ? { color: theme.text } : null]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, theme ? { color: theme.text } : null]}>Add Log</Text>

        <Text style={[styles.label, theme ? { color: theme.textMuted } : null]}>Habit</Text>
        <View style={styles.chipRow}>
          {habits.map((habit) => (
            <Pressable
              key={habit.id}
              onPress={() => setHabitId(habit.id)}
                style={{
                  ...styles.chip,
                  borderColor:
                    habitId === habit.id ? theme?.buttonBorder ?? 'rgba(255,255,255,0.34)' : theme?.border ?? 'rgba(255,255,255,0.22)',
                  backgroundColor:
                    habitId === habit.id ? theme?.buttonBg ?? 'rgba(255,255,255,0.2)' : theme?.panel ?? 'rgba(255,255,255,0.1)',
                }}
              >
              <Text style={[styles.chipText, theme ? { color: theme.text } : null]}>{habit.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, theme ? { color: theme.textMuted } : null]}>Date</Text>
        <View style={styles.dateRow}>
          <Pressable
            style={[styles.dateStep, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
            onPress={() => setLogDate((prev) => shiftIsoDate(prev, -1))}
          >
            <Text style={[styles.dateStepText, theme ? { color: theme.text } : null]}>-1 day</Text>
          </Pressable>
          <View style={[styles.dateCard, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}>
            <Text style={[styles.dateMain, theme ? { color: theme.text } : null]}>{prettyDate(logDate)}</Text>
            <Text style={[styles.dateSub, theme ? { color: theme.textMuted } : null]}>{logDate}</Text>
          </View>
          <Pressable
            style={[styles.dateStep, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
            onPress={() => setLogDate((prev) => shiftIsoDate(prev, 1))}
          >
            <Text style={[styles.dateStepText, theme ? { color: theme.text } : null]}>+1 day</Text>
          </Pressable>
        </View>
        <Pressable
          style={[styles.todayButton, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
          onPress={() => setLogDate(todayIso())}
        >
          <Text style={[styles.todayButtonText, theme ? { color: theme.text } : null]}>Today</Text>
        </Pressable>
        <TextInput
          style={[
            styles.input,
            theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null,
          ]}
          placeholder="Metric value"
          placeholderTextColor={theme ? theme.textMuted : '#cbd5e1'}
          value={metricValue}
          onChangeText={setMetricValue}
          keyboardType="numeric"
        />
        <TextInput
          style={[
            styles.input,
            theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null,
          ]}
          placeholder="Notes"
          placeholderTextColor={theme ? theme.textMuted : '#cbd5e1'}
          value={notes}
          onChangeText={setNotes}
        />
        {/* 13/04/26: Consistent dark primary action. */}
        <Pressable
          style={[
            styles.primaryButton,
            theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
          ]}
          onPress={saveLog}
        >
          <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Save Log</Text>
        </Pressable>
      </View>
    </View>
  );
}

// 13/04/26: Dark themed styles for logs.
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
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
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
    color: '#e5e7eb',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateStep: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dateStepText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  dateCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateMain: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  dateSub: {
    color: '#cbd5e1',
    marginTop: 2,
    fontSize: 12,
  },
  todayButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  todayButtonText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
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
