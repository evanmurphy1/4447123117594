// 19/04/26: Seed inserts core tables.
import { seedHabitsIfEmpty } from './seed';
import { categoriesTable, habitLogsTable, habitsTable, studentsTable, targetsTable } from './schema';
import { db } from './client';

type Row = Record<string, unknown>;

jest.mock('./client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

const mockedDb = db as unknown as {
  select: jest.Mock;
  insert: jest.Mock;
};

describe('seedHabitsIfEmpty', () => {
  // 19/04/26: In-memory db state.
  let state: {
    students: Row[];
    categories: Row[];
    habits: Row[];
    targets: Row[];
    logs: Row[];
  };
  let ids: { categories: number; habits: number; targets: number; logs: number };

  const rowsForTable = (table: unknown): Row[] => {
    if (table === studentsTable) return state.students;
    if (table === categoriesTable) return state.categories;
    if (table === habitsTable) return state.habits;
    if (table === targetsTable) return state.targets;
    if (table === habitLogsTable) return state.logs;
    return [];
  };

  const nextIdForTable = (table: unknown): number => {
    if (table === categoriesTable) return ids.categories++;
    if (table === habitsTable) return ids.habits++;
    if (table === targetsTable) return ids.targets++;
    if (table === habitLogsTable) return ids.logs++;
    return 1;
  };

  beforeEach(() => {
    // 19/04/26: Reset mock state.
    state = { students: [], categories: [], habits: [], targets: [], logs: [] };
    ids = { categories: 1, habits: 1, targets: 1, logs: 1 };

    mockedDb.select.mockImplementation(() => ({
      from: jest.fn((table: unknown) => ({
        where: jest.fn(async () => rowsForTable(table)),
      })),
    }));

    mockedDb.insert.mockImplementation((table: unknown) => ({
      values: jest.fn(async (payload: Row | Row[]) => {
        const list = Array.isArray(payload) ? payload : [payload];
        const target = rowsForTable(table);
        for (const item of list) {
          target.push({ id: nextIdForTable(table), ...item });
        }
      }),
    }));
  });

  it('inserts categories, habits, targets and logs once without duplicates', async () => {
    await seedHabitsIfEmpty();

    // 19/04/26: Verify first seed insert.
    expect(state.categories.length).toBeGreaterThan(0);
    expect(state.habits.length).toBeGreaterThan(0);
    expect(state.targets.length).toBeGreaterThan(0);
    expect(state.logs.length).toBeGreaterThan(0);

    const first = {
      categories: state.categories.length,
      habits: state.habits.length,
      targets: state.targets.length,
      logs: state.logs.length,
    };

    await seedHabitsIfEmpty();

    // 19/04/26: Verify second seed no dupes.
    expect(state.categories.length).toBe(first.categories);
    expect(state.habits.length).toBe(first.habits);
    expect(state.targets.length).toBe(first.targets);
    expect(state.logs.length).toBe(first.logs);
  });
});
