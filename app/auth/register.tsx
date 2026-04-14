// 14/04/26: Register screen logic.
import { eq } from 'drizzle-orm';
import { Link, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { HabitContext } from '@/app/_layout';
import { db } from '@/db/client';
import { authSessionTable, usersTable } from '@/db/schema';

export default function RegisterScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    if (!context) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      Alert.alert('Missing fields', 'Name, email, and password are required.');
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, trimmedEmail));
    if (existing.length > 0) {
      Alert.alert('Email already used', 'Try logging in instead.');
      return;
    }

    await db.insert(usersTable).values({
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
    });

    const created = await db.select().from(usersTable).where(eq(usersTable.email, trimmedEmail));
    const user = created[0];
    if (!user) return;

    await db.delete(authSessionTable);
    await db.insert(authSessionTable).values({ userId: user.id });
    context.setUser({ id: user.id, name: user.name, email: user.email });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor="#6b7280"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6b7280"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6b7280"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <Pressable style={styles.primaryButton} onPress={register}>
        <Text style={styles.primaryButtonText}>Create Account</Text>
      </Pressable>
      <Link href="/auth/login" style={styles.linkText}>
        Already have an account? Login
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#262626',
    color: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f1f1f',
    borderColor: '#3f3f46',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },
  linkText: {
    marginTop: 12,
    color: '#3b82f6',
    fontSize: 15,
  },
});
