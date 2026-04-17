// 14/04/26: Reusable labeled form field.
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useContext } from 'react';
import { HabitContext } from '@/app/_layout';

type FormFieldProps = {
  label: string;
  error?: string;
} & TextInputProps;

export default function FormField({ label, error, style, ...inputProps }: FormFieldProps) {
  const context = useContext(HabitContext);
  const theme = context?.theme;
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, theme ? { color: theme.textMuted } : null]}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor={inputProps.placeholderTextColor ?? (theme ? theme.textMuted : '#6b7280')}
        style={[
          styles.input,
          theme
            ? {
                borderColor: theme.border,
                backgroundColor: theme.panel,
                color: theme.text,
              }
            : null,
          style,
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  label: {
    color: '#9ca3af',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#262626',
    color: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  error: {
    color: '#fca5a5',
    marginTop: 6,
    fontSize: 12,
  },
});
