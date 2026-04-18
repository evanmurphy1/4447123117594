// 08/04/26: change to habit
import { eq } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { createContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { db } from '@/db/client';
import { authSessionTable, categoriesTable, habitsTable, usersTable } from '@/db/schema';
import { seedHabitsIfEmpty } from '@/db/seed';

// 18/04/26: Show foreground notifications.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type Habit = {
  id: number;
  name: string;
  categoryId: number;
  metricType: string;
  notes: string | null;
};

export type Category = {
  id: number;
  name: string;
  color: string;
  icon: string;
};

// 14/04/26: Logged user shape.
export type AppUser = {
  id: number;
  name: string;
  email: string;
};

export type AppTheme = {
  background: string;
  wash: string;
  stripe: string;
  panel: string;
  border: string;
  text: string;
  textMuted: string;
  buttonBg: string;
  buttonBorder: string;
};

const darkTheme: AppTheme = {
  background: '#0b1224',
  wash: 'rgba(30, 41, 59, 0.25)',
  stripe: 'rgba(125, 211, 252, 0.14)',
  panel: 'rgba(255,255,255,0.1)',
  border: 'rgba(255,255,255,0.24)',
  text: '#f8fafc',
  textMuted: '#cbd5e1',
  buttonBg: 'rgba(255,255,255,0.12)',
  buttonBorder: 'rgba(255,255,255,0.32)',
};

const lightTheme: AppTheme = {
  background: '#f4f8ff',
  wash: 'rgba(255, 255, 255, 0.45)',
  stripe: 'rgba(59, 130, 246, 0.12)',
  panel: 'rgba(255,255,255,0.72)',
  border: 'rgba(51, 65, 85, 0.22)',
  text: '#0f172a',
  textMuted: '#334155',
  buttonBg: 'rgba(255,255,255,0.7)',
  buttonBorder: 'rgba(51, 65, 85, 0.28)',
};

type HabitContextType = {
  habits: Habit[];
  categories: Category[];
  user: AppUser | null;
  themeMode: 'dark' | 'light';
  theme: AppTheme;
  setHabits: Dispatch<SetStateAction<Habit[]>>;
  setCategories: Dispatch<SetStateAction<Category[]>>;
  setUser: Dispatch<SetStateAction<AppUser | null>>;
  setThemeMode: Dispatch<SetStateAction<'dark' | 'light'>>;
};

export const HabitContext = createContext<HabitContextType | null>(null);

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // 14/04/26: Track current user.
  const [user, setUser] = useState<AppUser | null>(null);
  // 17/04/26: Persisted theme mode.
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  // 15/04/26: Auth check loaded.
  const [authReady, setAuthReady] = useState(false);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const themePath = `${FileSystem.documentDirectory}theme-mode.txt`;
      const info = await FileSystem.getInfoAsync(themePath);
      if (info.exists) {
        const saved = (await FileSystem.readAsStringAsync(themePath)).trim();
        if (saved === 'light' || saved === 'dark') {
          setThemeMode(saved);
        }
      }
      setThemeReady(true);

      await seedHabitsIfEmpty();
      await db.update(habitsTable).set({ metricType: 'count' });
      const [habitRows, categoryRows, sessions] = await Promise.all([
        db.select().from(habitsTable),
        db.select().from(categoriesTable),
        db.select().from(authSessionTable),
      ]);
      setHabits(habitRows as Habit[]);
      setCategories(categoryRows as Category[]);

      if (sessions.length > 0) {
        const active = sessions[0];
        const users = await db.select().from(usersTable).where(eq(usersTable.id, active.userId));
        const found = users[0];
        if (found) {
          setUser({ id: found.id, name: found.name, email: found.email });
        } else {
          await db.delete(authSessionTable);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setAuthReady(true);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const saveTheme = async () => {
      const themePath = `${FileSystem.documentDirectory}theme-mode.txt`;
      await FileSystem.writeAsStringAsync(themePath, themeMode);
    };
    saveTheme();
  }, [themeMode, themeReady]);

  useEffect(() => {
    if (!authReady) return;
    const inAuth = segments[0] === 'auth';
    if (!user && !inAuth) {
      router.replace('/auth/login');
      return;
    }
    if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [authReady, user, segments, router]);

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <HabitContext.Provider
      value={{
        habits,
        categories,
        user,
        themeMode,
        theme,
        setHabits,
        setCategories,
        setUser,
        setThemeMode,
      }}
    >
      {/* 13/04/26: Hide headers for clean layout. */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }} />
    </HabitContext.Provider>
  );
}
