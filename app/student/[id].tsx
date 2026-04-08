import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext } from 'react';
import { Button, Text, View } from 'react-native';

import { db } from '@/db/client';
import { studentsTable } from '@/db/schema';
import { Student, StudentContext } from '../_layout';
import { eq } from 'drizzle-orm';

export default function StudentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(StudentContext);

  if (!context) return null;

  const { students, setStudents } = context;
  const student = students.find((s: Student) => s.id === Number(id));

  if (!student) return null;

  const deleteStudent = async () => {
    await db.delete(studentsTable).where(eq(studentsTable.id, Number(id)));
    const rows = await db.select().from(studentsTable);
    setStudents(rows);
    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>{student.name}</Text>
      <Text>{student.major}</Text>
      <Text>{student.year}</Text>
      <Button
        title="Edit"
        onPress={() =>
          router.push({
            pathname: '../student/[id]/edit',
            params: { id },
          })
        }
      />
      <Button title="Delete" onPress={deleteStudent} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}
