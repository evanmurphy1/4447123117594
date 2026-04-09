// 09/04/26: Renders top bar with actions.
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// 09/04/26: Defines callbacks for header buttons.
type HomeHeaderNewProps = {
  title?: string;
  onOpenMenu?: () => void;
  onAddPress?: () => void;
};

// 09/04/26: Shows menu, title, and add button.
export default function HomeHeaderNew({
  title = 'Habits',
  onOpenMenu,
  onAddPress,
}: HomeHeaderNewProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onOpenMenu} style={styles.iconButton}>
        <Ionicons name="grid-outline" size={22} color="#ffffff" />
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <Pressable onPress={onAddPress} style={styles.iconButton}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}

// 09/04/26: Applies spacing and text styles.
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
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
