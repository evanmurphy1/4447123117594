import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const sqlite = openDatabaseSync('habit-tracker.db');

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    major TEXT NOT NULL,
    year TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    metric_type TEXT NOT NULL DEFAULT 'count',
    notes TEXT
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 0,
    habit_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    log_date TEXT NOT NULL,
    metric_value INTEGER NOT NULL DEFAULT 0,
    notes TEXT
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 0,
    period_type TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    category_id INTEGER,
    habit_id INTEGER
  );
`);

// 18/04/26: Add missing user_id columns on upgrades.
try {
  sqlite.execSync(`ALTER TABLE categories ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0;`);
} catch {}
try {
  sqlite.execSync(`ALTER TABLE habits ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0;`);
} catch {}
try {
  sqlite.execSync(`ALTER TABLE habit_logs ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0;`);
} catch {}
try {
  sqlite.execSync(`ALTER TABLE targets ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0;`);
} catch {}

// 14/04/26: Create users table.
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
  );
`);

// 14/04/26: Create auth session table.
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS auth_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite);
