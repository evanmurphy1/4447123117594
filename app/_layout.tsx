// 08/04/26: change to habit
import { Stack } from 'expo-router';
import { createContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { db } from '@/db/client';
import { categoriesTable, habitsTable } from '@/db/schema';
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

type HabitContextType = {
  habits: Habit[];
  categories: Category[];
  setHabits: Dispatch<SetStateAction<Habit[]>>;
  setCategories: Dispatch<SetStateAction<Category[]>>;
};

export const HabitContext = createContext<HabitContextType | null>(null);

export default function RootLayout() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadData = async () => {
      await seedHabitsIfEmpty();
      const [habitRows, categoryRows] = await Promise.all([
        db.select().from(habitsTable),
        db.select().from(categoriesTable),
      ]);
      setHabits(habitRows as Habit[]);
      setCategories(categoryRows as Category[]);
    };

    loadData();
  }, []);

  return (
    <HabitContext.Provider value={{ habits, categories, setHabits, setCategories }}>
      <Stack />
    </HabitContext.Provider>
  );
}
