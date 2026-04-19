// 19/04/26: Seeded list integration test.
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import IndexScreen from '@/app/(tabs)/index';
import { HabitContext, type AppTheme, type Category, type Habit } from '@/app/_layout';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace }),
}));

jest.mock('@react-navigation/native', () => ({
  // 19/04/26: Run focus callback immediately.
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('@/services/quotes', () => ({
  // 19/04/26: Avoid network in test.
  fetchMotivationalQuote: jest.fn(async () => ({
    text: 'Small steps every day.',
    author: 'Coach',
  })),
}));

const mockLogs = [
  { id: 1, habitId: 1, categoryId: 1, logDate: '2026-04-19', metricValue: 1, notes: 'Done' },
  { id: 2, habitId: 2, categoryId: 2, logDate: '2026-04-19', metricValue: 1, notes: 'Done' },
];

const mockSelect = jest.fn(() => ({
  from: jest.fn(() => ({
    where: jest.fn(async () => mockLogs),
  })),
}));

jest.mock('@/db/client', () => ({
  db: {
    // 19/04/26: Mock sqlite reads.
    select: (...args: unknown[]) => mockSelect(...args),
    insert: jest.fn(() => ({ values: jest.fn() })),
    delete: jest.fn(() => ({ where: jest.fn() })),
  },
}));

describe('IndexScreen integration', () => {
  it('shows seeded habits from app state after db init flow', async () => {
    const habits: Habit[] = [
      { id: 1, name: 'Walk 8k steps', categoryId: 1, metricType: 'count', notes: null },
      { id: 2, name: 'Study React Native', categoryId: 2, metricType: 'count', notes: null },
    ];
    const categories: Category[] = [
      { id: 1, name: 'Health', color: '#22c55e', icon: 'heart' },
      { id: 2, name: 'Study', color: '#3b82f6', icon: 'book' },
    ];
    const theme: AppTheme = {
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

    const contextValue = {
      habits,
      categories,
      user: { id: 1, name: 'Evan', email: 'evan@example.com' },
      themeMode: 'dark' as const,
      theme,
      setHabits: jest.fn(),
      setCategories: jest.fn(),
      setUser: jest.fn(),
      setThemeMode: jest.fn(),
    };

    const screen = render(
      <HabitContext.Provider value={contextValue}>
        <IndexScreen />
      </HabitContext.Provider>
    );

    // 19/04/26: Wait for loaded screen.
    await waitFor(() => {
      expect(screen.getByText('Walk 8k steps')).toBeTruthy();
      expect(screen.getByText('Study React Native')).toBeTruthy();
    });
  });
});
