// 14/04/26: Search and filter logs.
// 11/04/26: Lists habit logs with filters.
import { desc } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '@/db/client';
import { habitLogsTable } from '@/db/schema';
import { Habit, HabitContext } from '../_layout';

// 11/04/26: Defines shape for log row.
type HabitLogRow = {
  id: number;
  habitId: number;
  categoryId: number;
  logDate: string;
  metricValue: number;
  notes: string | null;
};

// 11/04/26: Renders logs list screen.
export default function LogsIndex() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const [logs, setLogs] = useState<HabitLogRow[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        const rows = await db.select().from(habitLogsTable).orderBy(desc(habitLogsTable.logDate));
        if (!active) return;
        setLogs(rows as HabitLogRow[]);
      };

      load();

      return () => {
        active = false;
      };
    }, [])
  );

  const habits = context?.habits ?? [];
  const categories = context?.categories ?? [];
  const habitLabel = (habitId: number) =>
    habits.find((h: Habit) => h.id === habitId)?.name ?? 'Unknown habit';
  const categoryLabel = (categoryId: number) =>
    categories.find((c) => c.id === categoryId)?.name ?? 'Unknown category';

  const filteredLogs = logs.filter((log) => {
    const text = `${habitLabel(log.habitId)} ${categoryLabel(log.categoryId)} ${log.notes ?? ''}`.toLowerCase();
    const matchesText = !query.trim() || text.includes(query.trim().toLowerCase());
    const matchesCategory = selectedCategoryId === null || log.categoryId === selectedCategoryId;
    const matchesFrom = !fromDate.trim() || log.logDate >= fromDate.trim();
    const matchesTo = !toDate.trim() || log.logDate <= toDate.trim();
    return matchesText && matchesCategory && matchesFrom && matchesTo;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Logs</Text>
      {/* 13/04/26: Consistent dark primary action. */}
      <Pressable style={styles.primaryButton} onPress={() => router.push('/logs/add')}>
        <Text style={styles.primaryButtonText}>Add Log</Text>
      </Pressable>
      <View style={styles.filterBox}>
        <TextInput
          style={styles.input}
          placeholder="Search habit/category/notes"
          placeholderTextColor="#6b7280"
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.chipRow}>
          <Pressable
            style={[styles.chip, selectedCategoryId === null ? styles.chipActive : null]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text style={styles.chipText}>All</Text>
          </Pressable>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[styles.chip, selectedCategoryId === category.id ? styles.chipActive : null]}
              onPress={() => setSelectedCategoryId(category.id)}
            >
              <Text style={styles.chipText}>{category.name}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="From YYYY-MM-DD"
            placeholderTextColor="#6b7280"
            value={fromDate}
            onChangeText={setFromDate}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="To YYYY-MM-DD"
            placeholderTextColor="#6b7280"
            value={toDate}
            onChangeText={setToDate}
          />
        </View>
      </View>
      {/* 14/04/26: Scroll long log entries. */}
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 120 }}>
        {filteredLogs.map((log) => (
          <Pressable
            key={log.id}
            onPress={() => router.push({ pathname: '/logs/[id]/edit', params: { id: log.id.toString() } })}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>{habitLabel(log.habitId)}</Text>
            <Text style={styles.cardMeta}>Category: {categoryLabel(log.categoryId)}</Text>
            <Text style={styles.cardMeta}>Date: {log.logDate}</Text>
            <Text style={styles.cardMeta}>Metric: {log.metricValue}</Text>
            <Text style={styles.cardMeta}>Notes: {log.notes || 'None'}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// 13/04/26: Dark themed styles for logs.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#171717',
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    color: '#3b82f6',
    fontWeight: '600',
  },
  list: {
    marginTop: 12,
    gap: 10,
  },
  filterBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#262626',
    color: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#262626',
  },
  chipActive: {
    backgroundColor: '#2f2f2f',
    borderColor: '#4b5563',
  },
  chipText: {
    color: '#e5e7eb',
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#262626',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  cardMeta: {
    color: '#9ca3af',
    marginTop: 2,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f1f1f',
    borderColor: '#3f3f46',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryButtonText: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600',
  },
});
