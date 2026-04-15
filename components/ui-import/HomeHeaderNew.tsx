// 09/04/26: Renders top bar with actions.
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// 09/04/26: Defines callbacks for header buttons.
type HomeHeaderNewProps = {
  title?: string;
  onAddPress?: () => void;
};

// 09/04/26: Shows menu, title, and add button.
export default function HomeHeaderNew({
  title = 'Habits',
  onAddPress,
}: HomeHeaderNewProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>

      <Pressable onPress={onAddPress} style={styles.iconButton}>
        <Ionicons name="add" size={28} color="#e5e7eb" />
      </Pressable>
    </View>
  );
}

// 13/04/26: Applies muted header typography.
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: '#e5e7eb',
    fontSize: 28,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
