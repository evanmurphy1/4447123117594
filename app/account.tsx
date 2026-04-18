// 14/04/26: Account actions screen.
import { eq } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { HabitContext } from '@/app/_layout';
import { db } from '@/db/client';
import { authSessionTable, categoriesTable, habitLogsTable, habitsTable, targetsTable, usersTable } from '@/db/schema';

export default function AccountScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const user = context?.user ?? null;
  const theme = context?.theme;
  const themeMode = context?.themeMode ?? 'dark';
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(20 * 60);
  const [scheduledMinutes, setScheduledMinutes] = useState(20 * 60);

  // 18/04/26: Reminder file path.
  const reminderPath = `${FileSystem.documentDirectory}daily-reminder.txt`;
  // 18/04/26: Reminder minutes path.
  const reminderTimePath = `${FileSystem.documentDirectory}daily-reminder-time.txt`;

  // 18/04/26: Load reminder setting.
  const loadReminderSetting = useCallback(async () => {
    const info = await FileSystem.getInfoAsync(reminderPath);
    if (info.exists) {
      const saved = (await FileSystem.readAsStringAsync(reminderPath)).trim();
      setReminderEnabled(saved === 'on');
    } else {
      setReminderEnabled(false);
    }
    const timeInfo = await FileSystem.getInfoAsync(reminderTimePath);
    if (!timeInfo.exists) {
      setReminderMinutes(20 * 60);
      return;
    }
    const savedTime = (await FileSystem.readAsStringAsync(reminderTimePath)).trim();
    const match = savedTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (match) {
      const hour = Number(match[1]);
      const minute = Number(match[2]);
      const total = hour * 60 + minute;
      setReminderMinutes(total);
      setScheduledMinutes(total);
      return;
    }
    setReminderMinutes(20 * 60);
    setScheduledMinutes(20 * 60);
  }, [reminderPath, reminderTimePath]);

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

  // 18/04/26: Load reminder on mount.
  useEffect(() => {
    loadReminderSetting();
  }, [loadReminderSetting]);

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

  // 18/04/26: Share exported csv.
  const exportCsv = async () => {
    try {
      const csv = await buildCsv();
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const path = `${FileSystem.documentDirectory}habit-export-${stamp}.csv`;
      await FileSystem.writeAsStringAsync(path, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      // 18/04/26: Open phone share sheet.
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv' });
        return;
      }
      Alert.alert('Export complete', `Saved to:\n${path}`);
    } catch {
      Alert.alert('Export failed', 'Could not create CSV file.');
    }
  };

  const toggleTheme = () => {
    if (!context) return;
    context.setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  // 18/04/26: Format reminder time text.
  const formatTime = (hour: number, minute: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:${String(minute).padStart(2, '0')} AM`;
    if (hour === 12) return `12:${String(minute).padStart(2, '0')} PM`;
    return `${hour - 12}:${String(minute).padStart(2, '0')} PM`;
  };

  // 18/04/26: Convert minutes to time.
  const timeFromMinutes = (totalMinutes: number) => {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return { hour, minute };
  };

  // 18/04/26: Shift reminder time safely.
  const shiftReminderTime = (deltaMinutes: number) => {
    const next = (reminderMinutes + deltaMinutes + 24 * 60) % (24 * 60);
    setReminderMinutes(next);
    const hour = Math.floor(next / 60);
    const minute = next % 60;
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    void FileSystem.writeAsStringAsync(reminderTimePath, value);
  };

  // 18/04/26: Ensure permission granted.
  const ensureReminderPermission = async () => {
    const existing = await Notifications.getPermissionsAsync();
    const permission = existing.status === 'granted' ? existing : await Notifications.requestPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow notifications to use reminders.');
      return false;
    }
    return true;
  };

  // 18/04/26: Schedule daily notification.
  const scheduleReminder = async (hour: number, minute: number) => {
    const ok = await ensureReminderPermission();
    if (!ok) return false;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminders', {
        name: 'Daily Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit reminder',
        body: 'Log your habits and check target progress.',
        ...(Platform.OS === 'android' ? { channelId: 'daily-reminders' } : null),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return true;
  };

  // 18/04/26: Enable reminder schedule.
  const enableReminder = async () => {
    try {
      const parsed = timeFromMinutes(reminderMinutes);
      const ok = await scheduleReminder(parsed.hour, parsed.minute);
      if (!ok) return;
      await FileSystem.writeAsStringAsync(reminderPath, 'on');
      const value = `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`;
      await FileSystem.writeAsStringAsync(reminderTimePath, value);
      setReminderEnabled(true);
      setScheduledMinutes(reminderMinutes);
      const now = new Date();
      const nowTotal = now.getHours() * 60 + now.getMinutes();
      const startsToday = reminderMinutes > nowTotal;
      Alert.alert(
        'Reminder enabled',
        `Daily reminder set for ${formatTime(parsed.hour, parsed.minute)}. ${startsToday ? 'First reminder is today.' : 'First reminder is tomorrow.'}`
      );
    } catch {
      Alert.alert('Reminder error', 'Could not enable reminder.');
    }
  };

  // 18/04/26: Schedule quick test notification.
  const sendTestReminder = async () => {
    try {
      const ok = await ensureReminderPermission();
      if (!ok) return;
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-reminders', {
          name: 'Daily Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Habit reminder test',
          body: 'This is your 10-second test notification.',
          ...(Platform.OS === 'android' ? { channelId: 'daily-reminders' } : null),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
        },
      });
      Alert.alert('Test scheduled', 'You should receive a notification in about 10 seconds.');
    } catch {
      Alert.alert('Test failed', 'Could not schedule test notification.');
    }
  };

  // 18/04/26: Disable daily reminder.
  const disableReminder = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await FileSystem.writeAsStringAsync(reminderPath, 'off');
      setReminderEnabled(false);
      Alert.alert('Reminder disabled', 'Daily reminder was turned off.');
    } catch {
      Alert.alert('Reminder error', 'Could not disable reminder.');
    }
  };

  // 18/04/26: Reminder needs update.
  const reminderNeedsUpdate = reminderEnabled && reminderMinutes !== scheduledMinutes;
  const reminderActionLabel = !reminderEnabled
    ? 'Enable Reminder'
    : reminderNeedsUpdate
      ? 'Update Reminder'
      : 'Disable Reminder';
  const reminderAction = !reminderEnabled
    ? enableReminder
    : reminderNeedsUpdate
      ? enableReminder
      : disableReminder;

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
              onPress={reminderAction}
            >
              <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>{reminderActionLabel}</Text>
            </Pressable>
            {/* 18/04/26: Reminder status text. */}
            <Text style={[styles.meta, theme ? { color: theme.textMuted } : null]}>
              Reminder: {reminderEnabled ? `On at ${formatTime(timeFromMinutes(reminderMinutes).hour, timeFromMinutes(reminderMinutes).minute)}` : 'Off'}
            </Text>
            {/* 18/04/26: Reminder time picker buttons. */}
            <View style={styles.timeWrap}>
              <View style={[styles.timeValue, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}>
                <Text style={[styles.timeValueText, theme ? { color: theme.text } : null]}>
                  {formatTime(timeFromMinutes(reminderMinutes).hour, timeFromMinutes(reminderMinutes).minute)}
                </Text>
              </View>
              <View style={styles.timeRow}>
                <Pressable
                  style={[styles.timeChip, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
                  onPress={() => shiftReminderTime(-60)}
                >
                  <Text style={[styles.timeChipText, theme ? { color: theme.text } : null]}>-1h</Text>
                </Pressable>
                <Pressable
                  style={[styles.timeChip, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
                  onPress={() => shiftReminderTime(-15)}
                >
                  <Text style={[styles.timeChipText, theme ? { color: theme.text } : null]}>-15m</Text>
                </Pressable>
                <Pressable
                  style={[styles.timeChip, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
                  onPress={() => shiftReminderTime(-1)}
                >
                  <Text style={[styles.timeChipText, theme ? { color: theme.text } : null]}>-1m</Text>
                </Pressable>
              </View>
              <View style={styles.timeRow}>
                <Pressable
                  style={[styles.timeChip, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
                  onPress={() => shiftReminderTime(60)}
                >
                  <Text style={[styles.timeChipText, theme ? { color: theme.text } : null]}>+1h</Text>
                </Pressable>
                <Pressable
                  style={[styles.timeChip, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
                  onPress={() => shiftReminderTime(15)}
                >
                  <Text style={[styles.timeChipText, theme ? { color: theme.text } : null]}>+15m</Text>
                </Pressable>
                <Pressable
                  style={[styles.timeChip, theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null]}
                  onPress={() => shiftReminderTime(1)}
                >
                  <Text style={[styles.timeChipText, theme ? { color: theme.text } : null]}>+1m</Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              style={[
                styles.primaryButton,
                theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
              ]}
              onPress={sendTestReminder}
            >
              <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Test in 10s</Text>
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
  timeWrap: {
    marginTop: 4,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 240,
    justifyContent: 'space-between',
  },
  timeChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 72,
    alignItems: 'center',
  },
  timeChipText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  timeValue: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  timeValueText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
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
