// 14/04/26: Account actions screen.
import { eq } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { HabitContext } from '@/app/_layout';
import { db } from '@/db/client';
import { authSessionTable, categoriesTable, habitLogsTable, habitsTable, targetsTable, usersTable } from '@/db/schema';

export default function AccountScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const user = context?.user ?? null;
  const theme = context?.theme;
  const themeMode = context?.themeMode ?? 'dark';

  useFocusEffect(
    useCallback(() => {
      const syncUser = async () => {
        if (!context) return;
        const sessions = await db.select().from(authSessionTable);
        if (sessions.length === 0) {
          context.setUser(null);
          return;
        }
        const active = sessions[0];
        const rows = await db.select().from(usersTable).where(eq(usersTable.id, active.userId));
        const found = rows[0];
        if (!found) {
          await db.delete(authSessionTable);
          context.setUser(null);
          return;
        }
        context.setUser({ id: found.id, name: found.name, email: found.email });
      };

      syncUser();
    }, [context])
  );

  const logout = async () => {
    if (!context) return;
    await db.delete(authSessionTable);
    context.setUser(null);
    router.replace('/auth/login');
  };

  const deleteProfile = async () => {
    if (!context || !user) return;
    await db.delete(authSessionTable);
    await db.delete(usersTable).where(eq(usersTable.id, user.id));
    context.setUser(null);
    router.replace('/auth/register');
  };

  // 17/04/26: Escape csv values.
  const csvValue = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  // 17/04/26: Build csv content.
  const buildCsv = async () => {
    const [categories, habits, logs, targets] = await Promise.all([
      db.select().from(categoriesTable),
      db.select().from(habitsTable),
      db.select().from(habitLogsTable),
      db.select().from(targetsTable),
    ]);

    const rows: string[] = [];
    rows.push(
      'record_type,id,name,color,habit_id,category_id,log_date,metric_value,period_type,target_value,notes'
    );

    categories.forEach((row) => {
      rows.push(
        [
          csvValue('category'),
          csvValue(row.id),
          csvValue(row.name),
          csvValue(row.color),
          csvValue(''),
          csvValue(''),
          csvValue(''),
          csvValue(''),
          csvValue(''),
          csvValue(''),
          csvValue(''),
        ].join(',')
      );
    });

    habits.forEach((row) => {
      rows.push(
        [
          csvValue('habit'),
          csvValue(row.id),
          csvValue(row.name),
          csvValue(''),
          csvValue(''),
          csvValue(row.categoryId),
          csvValue(''),
          csvValue(''),
          csvValue(''),
          csvValue(''),
          csvValue(row.notes ?? ''),
        ].join(',')
      );
    });

    logs.forEach((row) => {
      rows.push(
        [
          csvValue('habit_log'),
          csvValue(row.id),
          csvValue(''),
          csvValue(''),
          csvValue(row.habitId),
          csvValue(row.categoryId),
          csvValue(row.logDate),
          csvValue(row.metricValue),
          csvValue(''),
          csvValue(''),
          csvValue(row.notes ?? ''),
        ].join(',')
      );
    });

    targets.forEach((row) => {
      rows.push(
        [
          csvValue('target'),
          csvValue(row.id),
          csvValue(''),
          csvValue(''),
          csvValue(row.habitId ?? ''),
          csvValue(row.categoryId ?? ''),
          csvValue(''),
          csvValue(''),
          csvValue(row.periodType),
          csvValue(row.targetValue),
          csvValue(''),
        ].join(',')
      );
    });

    return rows.join('\n');
  };

  // 17/04/26: Export csv to file.
  const exportCsv = async () => {
    try {
      const csv = await buildCsv();
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const path = `${FileSystem.documentDirectory}habit-export-${stamp}.csv`;
      await FileSystem.writeAsStringAsync(path, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      Alert.alert('Export complete', `Saved to:\n${path}`);
    } catch {
      Alert.alert('Export failed', 'Could not create CSV file.');
    }
  };

  const toggleTheme = () => {
    if (!context) return;
    context.setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
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
        <Text style={[styles.title, theme ? { color: theme.text } : null]}>Account</Text>
        {user ? (
          <>
            <Text style={[styles.meta, theme ? { color: theme.textMuted } : null]}>Name: {user.name}</Text>
            <Text style={[styles.meta, theme ? { color: theme.textMuted } : null]}>Email: {user.email}</Text>
            <Pressable
              style={[
                styles.primaryButton,
                theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
              ]}
              onPress={toggleTheme}
            >
              <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>
                {themeMode === 'dark' ? 'Switch To Light' : 'Switch To Dark'}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.primaryButton,
                theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
              ]}
              onPress={logout}
            >
              <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Logout</Text>
            </Pressable>
            <Pressable
              style={[
                styles.primaryButton,
                theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
              ]}
              onPress={exportCsv}
            >
              <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Export CSV</Text>
            </Pressable>
            <Pressable
              style={styles.dangerButton}
              onPress={() =>
                Alert.alert('Delete profile?', 'This cannot be undone.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: deleteProfile },
                ])
              }
            >
              <Text style={styles.dangerButtonText}>Delete Profile</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={[
                styles.primaryButton,
                theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
              ]}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Login</Text>
            </Pressable>
            <Pressable
              style={[
                styles.primaryButton,
                theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
              ]}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Register</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1224',
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
    width: 540,
    height: 220,
    backgroundColor: 'rgba(125, 211, 252, 0.14)',
    top: 40,
    right: -150,
    transform: [{ rotate: '-16deg' }],
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    color: '#f8fafc',
    fontWeight: '600',
  },
  meta: {
    color: '#e2e8f0',
    marginBottom: 6,
    fontSize: 15,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.32)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(127, 29, 29, 0.35)',
    borderColor: 'rgba(254, 202, 202, 0.5)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },
  dangerButtonText: {
    color: '#fecaca',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
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
