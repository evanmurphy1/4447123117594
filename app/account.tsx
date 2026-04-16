// 14/04/26: Account actions screen.
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { HabitContext } from '@/app/_layout';
import { db } from '@/db/client';
import { authSessionTable, usersTable } from '@/db/schema';

export default function AccountScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const user = context?.user ?? null;

  useFocusEffect(
    useCallback(() => {
      const syncUser = async () => {
        if (!context) return;
        const sessions = await db.select().from(authSessionTable);
        if (sessions.length === 0) {
          context.setUser(null);
          return;
        }
        const active = sessions[0];
        const rows = await db.select().from(usersTable).where(eq(usersTable.id, active.userId));
        const found = rows[0];
        if (!found) {
          await db.delete(authSessionTable);
          context.setUser(null);
          return;
        }
        context.setUser({ id: found.id, name: found.name, email: found.email });
      };

      syncUser();
    }, [context])
  );

  const logout = async () => {
    if (!context) return;
    await db.delete(authSessionTable);
    context.setUser(null);
    router.replace('/auth/login');
  };

  const deleteProfile = async () => {
    if (!context || !user) return;
    await db.delete(authSessionTable);
    await db.delete(usersTable).where(eq(usersTable.id, user.id));
    context.setUser(null);
    router.replace('/auth/register');
  };

  return (
    <View style={styles.screen}>
      {/* 16/04/26: Layered backdrop style. */}
      <View style={styles.bgWash} />
      <View style={styles.bgStripe} />
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Account</Text>
        {user ? (
          <>
            <Text style={styles.meta}>Name: {user.name}</Text>
            <Text style={styles.meta}>Email: {user.email}</Text>
            <Pressable style={styles.primaryButton} onPress={logout}>
              <Text style={styles.primaryButtonText}>Logout</Text>
            </Pressable>
            <Pressable
              style={styles.dangerButton}
              onPress={() =>
                Alert.alert('Delete profile?', 'This cannot be undone.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: deleteProfile },
                ])
              }
            >
              <Text style={styles.dangerButtonText}>Delete Profile</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/login')}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/register')}>
              <Text style={styles.primaryButtonText}>Register</Text>
            </Pressable>
          </>
        )}
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
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
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
    top: 40,
    right: -150,
    transform: [{ rotate: '-16deg' }],
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    color: '#f8fafc',
    fontWeight: '600',
  },
  meta: {
    color: '#e2e8f0',
    marginBottom: 6,
    fontSize: 15,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.32)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(127, 29, 29, 0.35)',
    borderColor: 'rgba(254, 202, 202, 0.5)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },
  dangerButtonText: {
    color: '#fecaca',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
});
