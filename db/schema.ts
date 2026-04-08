import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const studentsTable = sqliteTable('students', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  major: text('major').notNull(),
  year: text('year').notNull(),
  count: integer('count').notNull().default(0),
});

export const categoriesTable = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
});

export const habitsTable = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  categoryId: integer('category_id').notNull(),
  metricType: text('metric_type').notNull().default('count'),
  notes: text('notes'),
});

export const habitLogsTable = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habit_id').notNull(),
  categoryId: integer('category_id').notNull(),
  logDate: text('log_date').notNull(),
  metricValue: integer('metric_value').notNull().default(0),
  notes: text('notes'),
});

export const targetsTable = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  periodType: text('period_type').notNull(), // weekly | monthly
  targetValue: integer('target_value').notNull(),
  categoryId: integer('category_id'),
  habitId: integer('habit_id'),
});
