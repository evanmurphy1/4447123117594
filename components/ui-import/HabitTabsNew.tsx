// 09/04/26: Renders tab pills for view switching.
import React, { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HabitContext } from '@/app/_layout';

// 09/04/26: Defines props for reusable tabs component.
type HabitTabsNewProps = {
  filters: readonly string[];
  activeTab: string;
  onChange: (tab: string) => void;
};

// 09/04/26: Displays selectable tabs with active styles.
export default function HabitTabsNew({ filters, activeTab, onChange }: HabitTabsNewProps) {
  const context = useContext(HabitContext);
  const theme = context?.theme;
  return (
    <View style={styles.row}>
      {filters.map((item) => {
        const active = item === activeTab;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={[
              styles.pill,
              active ? styles.activePill : styles.inactivePill,
              theme
                ? {
                    borderColor: active ? '#57e3e6' : '#2d8f96',
                  }
                : null,
            ]}
          >
            <Text
              style={[
                styles.label,
                active ? styles.activeLabel : styles.inactiveLabel,
                theme ? { color: active ? theme.text : theme.textMuted } : null,
              ]}
            >
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
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activePill: {
    backgroundColor: '#14c8d4',
    borderColor: '#57e3e6',
  },
  inactivePill: {
    backgroundColor: '#0d6f78',
    borderColor: '#2d8f96',
  },
  label: {
    fontWeight: '600',
  },
  activeLabel: {
    color: '#06242a',
  },
  inactiveLabel: {
    color: '#d6fcff',
  },
});
