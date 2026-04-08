import { Student } from '@/app/_layout';
import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

type Props = {
  student: Student;
};

export default function StudentCard({ student }: Props) {
  const router = useRouter();

  return (
    <View style={{ marginBottom: 12, padding: 10, borderWidth: 1 }}>
      <Text
        style={{ fontSize: 18 }}
        onPress={() =>
          router.push({ pathname: '/student/[id]', params: { id: student.id.toString() } })
        }
      >
        {student.name}
      </Text>
      <Text>Major: {student.major}</Text>
      <Text>Year: {student.year}</Text>
      <Button
        title="View"
        onPress={() =>
          router.push({ pathname: '/student/[id]', params: { id: student.id.toString() } })
        }
      />
    </View>
  );
}
