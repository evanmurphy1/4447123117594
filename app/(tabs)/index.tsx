import StudentCard from '@/components/StudentCard';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Button, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Student, StudentContext } from '../_layout';

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(StudentContext);

  if (!context) return null;

  const { students } = context;

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Students</Text>
      <Button title="Add Student" onPress={() => router.push({ pathname: '../add' })} />
      {students.map((student: Student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </SafeAreaView>
  );
}
