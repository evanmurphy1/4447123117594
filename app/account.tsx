// 14/04/26: Account actions screen.
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { HabitContext } from '@/app/_layout';
import { db } from '@/db/client';
import { authSessionTable, usersTable } from '@/db/schema';

export default function AccountScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const user = context?.user ?? null;

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
        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/login')}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#171717',
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  meta: {
    color: '#e5e7eb',
    marginBottom: 6,
    fontSize: 15,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f1f1f',
    borderColor: '#3f3f46',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#3f1f1f',
    borderColor: '#7f1d1d',
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
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600',
  },
});
