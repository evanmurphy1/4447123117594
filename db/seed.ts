// 08/04/26: Seed helpers for habits 
import { eq } from 'drizzle-orm';
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
  await seedHabitsForUser(0);
}

// 18/04/26: Seed data for one user.
export async function seedHabitsForUser(userId: number) {
  // 18/04/26: Rich habit seed.
  const existingHabits = await db.select().from(habitsTable).where(eq(habitsTable.userId, userId));
  if (existingHabits.length > 0) return;

  // 18/04/26: Insert core categories.
  await db.insert(categoriesTable).values([
    { userId, name: 'Health', color: '#22c55e', icon: 'heart' },
    { userId, name: 'Study', color: '#3b82f6', icon: 'book' },
    { userId, name: 'Mindset', color: '#f59e0b', icon: 'sun' },
    { userId, name: 'Productivity', color: '#a855f7', icon: 'briefcase' },
  ]);

  const categories = await db.select().from(categoriesTable).where(eq(categoriesTable.userId, userId));
  const health = categories.find((c) => c.name === 'Health');
  const study = categories.find((c) => c.name === 'Study');
  const mindset = categories.find((c) => c.name === 'Mindset');
  const productivity = categories.find((c) => c.name === 'Productivity');
  if (!health || !study || !mindset || !productivity) return;

  // 18/04/26: Insert demo habits.
  await db.insert(habitsTable).values([
    { userId, name: 'Walk 8k steps', categoryId: health.id, metricType: 'count', notes: 'Daily movement' },
    { userId, name: 'Workout Session', categoryId: health.id, metricType: 'count', notes: 'Strength or cardio' },
    { userId, name: 'Study React Native', categoryId: study.id, metricType: 'count', notes: 'Lecture + practice' },
    { userId, name: 'Deep Work Block', categoryId: productivity.id, metricType: 'count', notes: 'Focused work block' },
    { userId, name: 'Meditation', categoryId: mindset.id, metricType: 'count', notes: 'Morning routine' },
  ]);

  const habits = await db.select().from(habitsTable).where(eq(habitsTable.userId, userId));
  const walk = habits.find((h) => h.name === 'Walk 8k steps');
  const workout = habits.find((h) => h.name === 'Workout Session');
  const studyHabit = habits.find((h) => h.name === 'Study React Native');
  const deepWork = habits.find((h) => h.name === 'Deep Work Block');
  const meditation = habits.find((h) => h.name === 'Meditation');
  if (!walk || !workout || !studyHabit || !deepWork || !meditation) return;

  // 18/04/26: Insert target mix.
  await db.insert(targetsTable).values([
    { userId, periodType: 'weekly', targetValue: 5, habitId: walk.id, categoryId: health.id },
    { userId, periodType: 'weekly', targetValue: 3, habitId: workout.id, categoryId: health.id },
    { userId, periodType: 'weekly', targetValue: 5, habitId: studyHabit.id, categoryId: study.id },
    { userId, periodType: 'weekly', targetValue: 5, habitId: deepWork.id, categoryId: productivity.id },
    { userId, periodType: 'weekly', targetValue: 6, habitId: meditation.id, categoryId: mindset.id },
    { userId, periodType: 'monthly', targetValue: 22, habitId: walk.id, categoryId: health.id },
    { userId, periodType: 'monthly', targetValue: 13, habitId: workout.id, categoryId: health.id },
    { userId, periodType: 'monthly', targetValue: 20, habitId: studyHabit.id, categoryId: study.id },
    { userId, periodType: 'monthly', targetValue: 20, habitId: deepWork.id, categoryId: productivity.id },
    { userId, periodType: 'monthly', targetValue: 24, habitId: meditation.id, categoryId: mindset.id },
    { userId, periodType: 'monthly', targetValue: 90, habitId: null, categoryId: null },
  ]);

  // 18/04/26: Date helper builder.
  const today = new Date();
  const d = (offset: number) => {
    const copy = new Date(today);
    copy.setDate(today.getDate() - offset);
    return copy.toISOString().slice(0, 10);
  };

  // 18/04/26: Build demo logs.
  const logs: Array<{
    habitId: number;
    categoryId: number;
    logDate: string;
    metricValue: number;
    notes: string;
  }> = [];

  for (let offset = 60; offset >= 0; offset -= 1) {
    const dateValue = d(offset);
    const day = new Date(dateValue).getDay();

    if (day !== 0 && offset % 9 !== 0) {
      logs.push({
        userId,
        habitId: walk.id,
        categoryId: health.id,
        logDate: dateValue,
        metricValue: 1,
        notes: 'Evening walk',
      });
    }

    if ((day === 1 || day === 3 || day === 5) && offset % 5 !== 0) {
      logs.push({
        userId,
        habitId: workout.id,
        categoryId: health.id,
        logDate: dateValue,
        metricValue: 1,
        notes: 'Gym session',
      });
    }

    if (day >= 1 && day <= 5 && offset % 6 !== 0) {
      logs.push({
        userId,
        habitId: studyHabit.id,
        categoryId: study.id,
        logDate: dateValue,
        metricValue: 1,
        notes: 'Course practice',
      });
    }

    if (day >= 1 && day <= 5 && offset % 7 !== 0) {
      logs.push({
        userId,
        habitId: deepWork.id,
        categoryId: productivity.id,
        logDate: dateValue,
        metricValue: 1,
        notes: 'Focus block',
      });
    }

    if (offset % 4 !== 0) {
      logs.push({
        userId,
        habitId: meditation.id,
        categoryId: mindset.id,
        logDate: dateValue,
        metricValue: 1,
        notes: 'Morning breathing',
      });
    }
  }

  // 18/04/26: Insert demo logs.
  await db.insert(habitLogsTable).values(logs);
}
