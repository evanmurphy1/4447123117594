// 08/04/26: change to habit
import { eq } from 'drizzle-orm';
import { Stack, useRouter, useSegments } from 'expo-router';
import { createContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { db } from '@/db/client';
import { authSessionTable, categoriesTable, habitsTable, usersTable } from '@/db/schema';
import { seedHabitsIfEmpty } from '@/db/seed';

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

type HabitContextType = {
  habits: Habit[];
  categories: Category[];
  user: AppUser | null;
  setHabits: Dispatch<SetStateAction<Habit[]>>;
  setCategories: Dispatch<SetStateAction<Category[]>>;
  setUser: Dispatch<SetStateAction<AppUser | null>>;
};

export const HabitContext = createContext<HabitContextType | null>(null);

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // 14/04/26: Track current user.
  const [user, setUser] = useState<AppUser | null>(null);
  // 15/04/26: Auth check loaded.
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
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

  return (
    <HabitContext.Provider value={{ habits, categories, user, setHabits, setCategories, setUser }}>
      {/* 13/04/26: Hide headers for clean layout. */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#171717' } }} />
    </HabitContext.Provider>
  );
}
