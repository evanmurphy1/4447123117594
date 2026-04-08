import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { studentsTable } from '@/db/schema';
import { Student, StudentContext } from '../../_layout';

export default function EditStudent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(StudentContext);

  if (!context) return null;

  const { students, setStudents } = context;
  const student = students.find((s: Student) => s.id === Number(id));

  if (!student) return null;

  const [name, setName] = useState(student.name);
  const [major, setMajor] = useState(student.major);
  const [year, setYear] = useState(student.year);

  const saveChanges = async () => {
    await db
      .update(studentsTable)
      .set({ name, major, year })
      .where(eq(studentsTable.id, Number(id)));

    const rows = await db.select().from(studentsTable);
    setStudents(rows);
    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput value={name} onChangeText={setName} />
      <TextInput value={major} onChangeText={setMajor} />
      <TextInput value={year} onChangeText={setYear} />
      <Button title="Save Changes" onPress={saveChanges} />
    </View>
  );
}
