import { Stack } from 'expo-router';
import { createContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { db } from '@/db/client';
import { seedStudentsIfEmpty } from '@/db/seed';
import { studentsTable } from '@/db/schema';

export type Student = {
  id: number;
  name: string;
  major: string;
  year: string;
  count: number;
};

type StudentContextType = {
  students: Student[];
  setStudents: Dispatch<SetStateAction<Student[]>>;
};

export const StudentContext = createContext<StudentContextType | null>(null);

export default function RootLayout() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      await seedStudentsIfEmpty();
      const rows = await db.select().from(studentsTable);
      setStudents(rows as Student[]);
    };

    loadStudents();
  }, []);

  return (
    <StudentContext.Provider value={{ students, setStudents }}>
      <Stack />
    </StudentContext.Provider>
  );
}
