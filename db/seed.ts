// 08/04/26: Seed helpers for habits 
import { db } from './client';
import {
  categoriesTable,
  habitLogsTable,
  habitsTable,
  studentsTable,
  targetsTable,
} from './schema';

export async function seedStudentsIfEmpty() {
  // 08/04/26: kept student seed 
  const existing = await db.select().from(studentsTable);
  if (existing.length > 0) return;

  await db.insert(studentsTable).values([
    { name: 'Emilia', major: 'Computer Science', year: '3', count: 0 },
    { name: 'Jackie', major: 'Business', year: '2', count: 0 },
    { name: 'Sammy', major: 'Engineering', year: '4', count: 0 },
  ]);
}

export async function seedHabitsIfEmpty() {
  // 08/04/26: Main habit tracker seed path
  const existingHabits = await db.select().from(habitsTable);
  if (existingHabits.length > 0) return;

  await db.insert(categoriesTable).values([
    { name: 'Health', color: '#22c55e', icon: 'heart' },
    { name: 'Study', color: '#3b82f6', icon: 'book' },
    { name: 'Mindset', color: '#f59e0b', icon: 'sparkles' },
  ]);

  const categories = await db.select().from(categoriesTable);
  const health = categories.find((c) => c.name === 'Health');
  const study = categories.find((c) => c.name === 'Study');
  const mindset = categories.find((c) => c.name === 'Mindset');
  if (!health || !study || !mindset) return;

  await db.insert(habitsTable).values([
    { name: 'Walk 8k steps', categoryId: health.id, metricType: 'count', notes: 'Daily movement' },
    {
      name: 'Study React Native',
      categoryId: study.id,
      metricType: 'minutes',
      notes: 'Lecture + practice',
    },
    {
      name: 'Meditation',
      categoryId: mindset.id,
      metricType: 'minutes',
      notes: 'Morning routine',
    },
  ]);

  const habits = await db.select().from(habitsTable);
  await db.insert(targetsTable).values([
    { periodType: 'weekly', targetValue: 5, habitId: habits[0]?.id ?? null, categoryId: health.id },
    {
      periodType: 'weekly',
      targetValue: 240,
      habitId: habits[1]?.id ?? null,
      categoryId: study.id,
    },
    {
      periodType: 'monthly',
      targetValue: 300,
      habitId: habits[2]?.id ?? null,
      categoryId: mindset.id,
    },
  ]);

  const today = new Date();
  const d = (offset: number) => {
    const copy = new Date(today);
    copy.setDate(today.getDate() - offset);
    return copy.toISOString().slice(0, 10);
  };

  await db.insert(habitLogsTable).values([
    {
      habitId: habits[0]?.id ?? 0,
      categoryId: health.id,
      logDate: d(0),
      metricValue: 1,
      notes: 'Done',
    },
    {
      habitId: habits[0]?.id ?? 0,
      categoryId: health.id,
      logDate: d(1),
      metricValue: 1,
      notes: 'Done',
    },
    {
      habitId: habits[1]?.id ?? 0,
      categoryId: study.id,
      logDate: d(0),
      metricValue: 45,
      notes: 'Hooks practice',
    },
    {
      habitId: habits[2]?.id ?? 0,
      categoryId: mindset.id,
      logDate: d(0),
      metricValue: 15,
      notes: 'Breathing',
    },
  ]);
}
