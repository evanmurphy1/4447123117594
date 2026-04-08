//08/04/26 changed for habits
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Button, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HabitCard from '@/components/HabitCard';
import { Habit, HabitContext } from '../_layout';

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);

  if (!context) return null;

  const { habits } = context;

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Habit Tracker</Text>
      <Button title="Add Habit" onPress={() => router.push({ pathname: '../add' })} />
      {habits.map((habit: Habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </SafeAreaView>
  );
}
