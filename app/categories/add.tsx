// 11/04/26: Adds new category with fields.
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '@/db/client';
import { categoriesTable } from '@/db/schema';
import { HabitContext } from '../_layout';

// 11/04/26: Renders add category form.
export default function AddCategory() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const theme = context?.theme;

  const [name, setName] = useState('');
  const [color, setColor] = useState('#22c55e');

  const saveCategory = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    await db.insert(categoriesTable).values({
      name: trimmed,
      color: color.trim() || '#22c55e',
      icon: 'tag',
    });

    const rows = await db.select().from(categoriesTable);
    context?.setCategories(rows);
    router.back();
  };

  return (
    <View style={[styles.screen, theme ? { backgroundColor: theme.background } : null]}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={[styles.bgWash, theme ? { backgroundColor: theme.wash } : null]} />
      <View style={[styles.bgStripe, theme ? { backgroundColor: theme.stripe } : null]} />
      <View style={styles.container}>
        <Pressable
          style={[
            styles.backButton,
            theme ? { borderColor: theme.border, backgroundColor: theme.panel } : null,
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, theme ? { color: theme.text } : null]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, theme ? { color: theme.text } : null]}>Add Category</Text>
        <TextInput
          style={[
            styles.input,
            theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null,
          ]}
          placeholder="Name"
          placeholderTextColor={theme ? theme.textMuted : '#cbd5e1'}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[
            styles.input,
            theme ? { borderColor: theme.border, backgroundColor: theme.panel, color: theme.text } : null,
          ]}
          placeholder="Color (hex)"
          placeholderTextColor={theme ? theme.textMuted : '#cbd5e1'}
          value={color}
          onChangeText={setColor}
        />
        {/* 13/04/26: Consistent dark primary action. */}
        <Pressable
          style={[
            styles.primaryButton,
            theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
          ]}
          onPress={saveCategory}
        >
          <Text style={[styles.primaryButtonText, theme ? { color: theme.text } : null]}>Save Category</Text>
        </Pressable>
      </View>
    </View>
  );
}

// 13/04/26: Dark themed styles for forms.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1224',
  },
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
    flex: 1,
  },
  bgWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 41, 59, 0.25)',
  },
  bgStripe: {
    position: 'absolute',
    width: 540,
    height: 220,
    backgroundColor: 'rgba(125, 211, 252, 0.14)',
    top: 20,
    right: -150,
    transform: [{ rotate: '-16deg' }],
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    color: '#f8fafc',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.34)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
});
