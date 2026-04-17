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
  const theme = context?.theme;
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
    <View style={[styles.screen, theme ? { backgroundColor: theme.background } : null]}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={[styles.bgWash, theme ? { backgroundColor: theme.wash } : null]} />
      <View style={[styles.bgStripe, theme ? { backgroundColor: theme.stripe } : null]} />
      <SafeAreaView style={styles.container}>
        <Pressable
          style={[
            styles.backButton,
            theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null,
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, theme ? { color: theme.text } : null]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, theme ? { color: theme.text } : null]}>Logs</Text>
        {/* 13/04/26: Consistent dark primary action. */}
        <Pressable
          style={[
            styles.primaryButton,
            theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
          ]}
          onPress={() => router.push('/logs/add')}
        >
          <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Add Log</Text>
        </Pressable>
        <View style={[styles.filterBox, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}>
          <TextInput
            style={[
              styles.input,
              theme ? { borderColor: theme.border, backgroundColor: theme.buttonBg, color: theme.text } : null,
            ]}
            placeholder="Search habit/category/notes"
            placeholderTextColor={theme ? theme.textMuted : '#cbd5e1'}
            value={query}
            onChangeText={setQuery}
          />
          <View style={styles.chipRow}>
            <Pressable
              style={[
                styles.chip,
                selectedCategoryId === null ? styles.chipActive : null,
                theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null,
                selectedCategoryId === null && theme
                  ? { borderColor: theme.buttonBorder, backgroundColor: theme.buttonBg }
                  : null,
              ]}
              onPress={() => setSelectedCategoryId(null)}
            >
              <Text style={[styles.chipText, theme ? { color: theme.text } : null]}>All</Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.chip,
                  selectedCategoryId === category.id ? styles.chipActive : null,
                  theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null,
                  selectedCategoryId === category.id && theme
                    ? { borderColor: theme.buttonBorder, backgroundColor: theme.buttonBg }
                    : null,
                ]}
                onPress={() => setSelectedCategoryId(category.id)}
              >
                <Text style={[styles.chipText, theme ? { color: theme.text } : null]}>{category.name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            <TextInput
              style={[
                styles.input,
                styles.halfInput,
                theme ? { borderColor: theme.border, backgroundColor: theme.buttonBg, color: theme.text } : null,
              ]}
              placeholder="From YYYY-MM-DD"
              placeholderTextColor={theme ? theme.textMuted : '#cbd5e1'}
              value={fromDate}
              onChangeText={setFromDate}
            />
            <TextInput
              style={[
                styles.input,
                styles.halfInput,
                theme ? { borderColor: theme.border, backgroundColor: theme.buttonBg, color: theme.text } : null,
              ]}
              placeholder="To YYYY-MM-DD"
              placeholderTextColor={theme ? theme.textMuted : '#cbd5e1'}
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
              style={[styles.card, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
            >
              <Text style={[styles.cardTitle, theme ? { color: theme.text } : null]}>{habitLabel(log.habitId)}</Text>
              <Text style={[styles.cardMeta, theme ? { color: theme.textMuted } : null]}>
                Category: {categoryLabel(log.categoryId)}
              </Text>
              <Text style={[styles.cardMeta, theme ? { color: theme.textMuted } : null]}>Date: {log.logDate}</Text>
              <Text style={[styles.cardMeta, theme ? { color: theme.textMuted } : null]}>Metric: {log.metricValue}</Text>
              <Text style={[styles.cardMeta, theme ? { color: theme.textMuted } : null]}>Notes: {log.notes || 'None'}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// 13/04/26: Dark themed styles for logs.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090f1f',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
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
    width: 560,
    height: 220,
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    top: 30,
    right: -150,
    transform: [{ rotate: '-16deg' }],
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    color: '#f8fafc',
    fontWeight: '600',
  },
  list: {
    marginTop: 12,
    gap: 10,
  },
  filterBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#f8fafc',
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
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.34)',
  },
  chipText: {
    color: '#f8fafc',
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  cardMeta: {
    color: '#cbd5e1',
    marginTop: 2,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.32)',
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
