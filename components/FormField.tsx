// 14/04/26: Reusable labeled form field.
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type FormFieldProps = {
  label: string;
  error?: string;
} & TextInputProps;

export default function FormField({ label, error, style, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor={inputProps.placeholderTextColor ?? '#6b7280'}
        style={[styles.input, style]}
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
