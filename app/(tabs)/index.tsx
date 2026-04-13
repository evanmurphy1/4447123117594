//08/04/26 changed for habits
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HabitCard from '@/components/HabitCard';
import EmptyViewNew from '@/components/ui-import/EmptyViewNew';
import HabitTabsNew from '@/components/ui-import/HabitTabsNew';
import HomeHeaderNew from '@/components/ui-import/HomeHeaderNew';
import MonthlyViewNew from '@/components/ui-import/MonthlyViewNew';
import OverallViewNew from '@/components/ui-import/OverallViewNew';
import TodayViewNew from '@/components/ui-import/TodayViewNew';
import WeeklyViewNew from '@/components/ui-import/WeeklyViewNew';
import { Habit, HabitContext } from '../_layout';

// 09/04/26: Defines top filters for habits screen.
const FILTERS = ['Today', 'Weekly', 'Monthly', 'Overall'] as const;

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);
  // 09/04/26: Tracks currently selected habits filter tab.
  const [activeTab, setActiveTab] = useState<(typeof FILTERS)[number]>('Today');
  // 09/04/26: Reads habits safely before context guard.
  const habits = context?.habits ?? [];
  // 09/04/26: Keeps today list until other views added.
  const visibleHabits = habits;
  // 09/04/26: Shows empty state when no habits.
  const isEmpty = visibleHabits.length === 0;

  if (!context) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#171717', padding: 20 }}>
      <HomeHeaderNew onAddPress={() => router.push({ pathname: '../add' })} />
      {/* 11/04/26: Adds quick navigation to management screens. */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <Button title="Categories" onPress={() => router.push('/categories')} />
        <Button title="Logs" onPress={() => router.push('/logs')} />
        <Button title="Targets" onPress={() => router.push('/targets')} />
      </View>
      <HabitTabsNew filters={FILTERS} activeTab={activeTab} onChange={(tab) => setActiveTab(tab)} />

      {isEmpty ? (
        <EmptyViewNew onCreate={() => router.push({ pathname: '../add' })} />
      ) : (
        <View style={{ flex: 1 }}>
          <Button title="Add Habit" onPress={() => router.push({ pathname: '../add' })} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12 }}>
            {activeTab === 'Today' ? (
              <TodayViewNew
                habits={visibleHabits}
                onHabitPress={(habit) =>
                  router.push({ pathname: '/habit/[id]', params: { id: habit.id.toString() } })
                }
              />
            ) : activeTab === 'Weekly' ? (
              <WeeklyViewNew habits={visibleHabits} />
            ) : activeTab === 'Monthly' ? (
              <MonthlyViewNew habits={visibleHabits} />
            ) : activeTab === 'Overall' ? (
              <OverallViewNew habits={visibleHabits} />
            ) : (
              visibleHabits.map((habit: Habit) => <HabitCard key={habit.id} habit={habit} />)
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
