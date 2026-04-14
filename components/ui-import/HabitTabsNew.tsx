// 09/04/26: Renders tab pills for view switching.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// 09/04/26: Defines props for reusable tabs component.
type HabitTabsNewProps = {
  filters: readonly string[];
  activeTab: string;
  onChange: (tab: string) => void;
};

// 09/04/26: Displays selectable tabs with active styles.
export default function HabitTabsNew({ filters, activeTab, onChange }: HabitTabsNewProps) {
  return (
    <View style={styles.row}>
      {filters.map((item) => {
        const active = item === activeTab;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={[styles.pill, active ? styles.activePill : styles.inactivePill]}
          >
            <Text style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// 13/04/26: Darker tabs for unified theme.
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activePill: {
    backgroundColor: '#2f2f2f',
  },
  inactivePill: {
    backgroundColor: '#1f1f1f',
  },
  label: {
    fontWeight: '600',
  },
  activeLabel: {
    color: '#e5e7eb',
  },
  inactiveLabel: {
    color: '#9ca3af',
  },
});
