//08/04/26 added for habits 
import { Habit } from '@/app/_layout';
import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

type Props = {
  habit: Habit;
};

export default function HabitCard({ habit }: Props) {
  const router = useRouter();

  return (
    <View style={{ marginBottom: 12, padding: 10, borderWidth: 1, borderColor: '#d1d5db' }}>
      <Text
        style={{ fontSize: 18 }}
        onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id.toString() } })}
      >
        {habit.name}
      </Text>
      <Text>Metric: {habit.metricType}</Text>
      <Text>Notes: {habit.notes || 'No notes'}</Text>
      <Button
        title="View"
        onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id.toString() } })}
      />
    </View>
  );
}
