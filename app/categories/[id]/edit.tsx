// 11/04/26: Edits category details and deletes.
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { categoriesTable, habitsTable, habitLogsTable } from '@/db/schema';
import { Category, HabitContext } from '../../_layout';

// 11/04/26: Renders edit category screen.
export default function EditCategory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(HabitContext);

  const categories = context?.categories ?? [];
  const category = categories.find((c: Category) => c.id === Number(id));

  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? '');
  const [icon, setIcon] = useState(category?.icon ?? '');

  if (!category) return null;

  const saveChanges = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    await db
      .update(categoriesTable)
      .set({ name: trimmed, color: color.trim() || category.color, icon: icon.trim() || category.icon })
      .where(eq(categoriesTable.id, Number(id)));

    const rows = await db.select().from(categoriesTable);
    context?.setCategories(rows);
    router.back();
  };

  const deleteCategory = async () => {
    await db.delete(habitLogsTable).where(eq(habitLogsTable.categoryId, category.id));
    await db.delete(habitsTable).where(eq(habitsTable.categoryId, category.id));
    await db.delete(categoriesTable).where(eq(categoriesTable.id, category.id));
    const rows = await db.select().from(categoriesTable);
    context?.setCategories(rows);
    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Edit Category</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Name" />
      <TextInput value={color} onChangeText={setColor} placeholder="Color (hex)" />
      <TextInput value={icon} onChangeText={setIcon} placeholder="Icon name" />
      <Button title="Save Changes" onPress={saveChanges} />
      <Button title="Delete Category" onPress={deleteCategory} />
    </View>
  );
}
