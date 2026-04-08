import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { studentsTable } from '@/db/schema';
import { StudentContext } from './_layout';

export default function AddStudent() {
  const router = useRouter();
  const context = useContext(StudentContext);

  if (!context) return null;

  const { setStudents } = context;

  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');

  const saveStudent = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    await db.insert(studentsTable).values({
      name: trimmedName,
      major,
      year,
      count: 0,
    });

    const rows = await db.select().from(studentsTable);
    setStudents(rows);
    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Major" value={major} onChangeText={setMajor} />
      <TextInput placeholder="Year" value={year} onChangeText={setYear} />
      <Button title="Save" onPress={saveStudent} />
    </View>
  );
}
