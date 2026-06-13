import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { auth } from '../config/firebase';
import { signOutNativeGoogle } from '../services/googleAuthNative';
import { ensureUserProfile, getUserProfile, isProfileComplete } from '../services/users';
import type { UserProfile } from '../types';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileComplete: boolean;
  refreshProfile: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(currentUser: User) {
    const existing = await getUserProfile(currentUser.uid);
    if (existing) {
      setProfile(existing);
      return;
    }

    const created = await ensureUserProfile(currentUser);
    setProfile(created);
  }

  async function refreshProfile() {
    if (!auth.currentUser) {
      setProfile(null);
      return;
    }

    await loadProfile(auth.currentUser);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        await loadProfile(nextUser);
      } catch (error) {
        console.error('Failed to load user profile', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      profileComplete: isProfileComplete(profile),
      refreshProfile,
      signOutUser: async () => {
        await signOutNativeGoogle();
        await signOut(auth);
      },
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
