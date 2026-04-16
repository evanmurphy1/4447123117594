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
    <View style={styles.screen}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={styles.bgWash} />
      <View style={styles.bgStripe} />
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#cbd5e1"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#cbd5e1"
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#cbd5e1"
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1224',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
    paddingTop: 60,
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
    fontSize: 24,
    color: '#f8fafc',
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.32)',
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
  linkText: {
    marginTop: 12,
    color: '#cbd5e1',
    fontSize: 15,
  },
});
