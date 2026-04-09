// 09/04/26: Renders empty state with create action.
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <Pressable onPress={onCreate} style={styles.button}>
        <Ionicons name="add" size={20} color="#ffffff" />
        <Text style={styles.buttonText}>{buttonText}</Text>
      </Pressable>
    </View>
  );
}

// 09/04/26: Styles empty state for dark theme.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#ffffff',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
