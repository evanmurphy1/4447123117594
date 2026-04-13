// 11/04/26: Adds new category with fields.
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { categoriesTable } from '@/db/schema';
import { HabitContext } from '../_layout';

// 11/04/26: Renders add category form.
export default function AddCategory() {
  const router = useRouter();
  const context = useContext(HabitContext);

  const [name, setName] = useState('');
  const [color, setColor] = useState('#22c55e');
  const [icon, setIcon] = useState('heart');

  const saveCategory = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    await db.insert(categoriesTable).values({
      name: trimmed,
      color: color.trim() || '#22c55e',
      icon: icon.trim() || 'heart',
    });

    const rows = await db.select().from(categoriesTable);
    context?.setCategories(rows);
    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Add Category</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Color (hex)" value={color} onChangeText={setColor} />
      <TextInput placeholder="Icon name" value={icon} onChangeText={setIcon} />
      <Button title="Save Category" onPress={saveCategory} />
    </View>
  );
}
