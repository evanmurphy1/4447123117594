//08/04/26 changed for habit
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Habits' }} />
    </Tabs>
  );
}
