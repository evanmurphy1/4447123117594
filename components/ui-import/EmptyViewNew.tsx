// 09/04/26: Renders empty state with create action.
import { Ionicons } from '@expo/vector-icons';
import React, { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HabitContext } from '@/app/_layout';

// 09/04/26: Defines text and action props.
type EmptyViewNewProps = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onCreate?: () => void;
};

// 09/04/26: Displays fallback when no habits exist.
export default function EmptyViewNew({
  title = 'No habits found',
  subtitle = 'Create a habit to start tracking.',
  buttonText = 'Create',
  onCreate,
}: EmptyViewNewProps) {
  const context = useContext(HabitContext);
  const theme = context?.theme;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, theme ? { color: theme.text } : null]}>{title}</Text>
      <Text style={[styles.subtitle, theme ? { color: theme.textMuted } : null]}>{subtitle}</Text>

      <Pressable
        onPress={onCreate}
        style={[
          styles.button,
          theme ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder } : null,
        ]}
      >
        <Ionicons name="add" size={20} color={theme ? theme.text : '#e5e7eb'} />
        <Text style={[styles.buttonText, theme ? { color: theme.text } : null]}>{buttonText}</Text>
      </Pressable>
    </View>
  );
}

// 13/04/26: Aligns empty state with theme.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#e5e7eb',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#262626',
    borderColor: '#3f3f46',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '500',
  },
});
