// 14/04/26: Login screen logic.
import { and, eq } from 'drizzle-orm';
import { Link, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { HabitContext } from '@/app/_layout';
import { db } from '@/db/client';
import { authSessionTable, usersTable } from '@/db/schema';

export default function LoginScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    if (!context) return;
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Missing fields', 'Email and password are required.');
      return;
    }

    const rows = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, trimmedEmail), eq(usersTable.password, trimmedPassword)));
    const user = rows[0];
    if (!user) {
      Alert.alert('Invalid login', 'Check your email and password.');
      return;
    }

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
        <Text style={styles.title}>Login</Text>
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
        <Pressable style={styles.primaryButton} onPress={login}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>
        <Link href="/auth/register" style={styles.linkText}>
          New here? Create account
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
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
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
