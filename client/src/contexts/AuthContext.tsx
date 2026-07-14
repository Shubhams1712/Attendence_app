import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import * as services from '@/lib/services';
import type { Profile, Class } from '@/types';

interface AuthContextType {
  user: Profile | null;
  classData: Class | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isOwner: boolean;
  isCR: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setUser(null);
          setClassData(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const profile = await services.getProfile(userId);
      if (profile) {
        setUser(profile);
        // Get the user's class
        const classes = await services.getUserClasses(userId);
        if (classes.length > 0) {
          setClassData(classes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const signInFn = useCallback(async (email: string, password: string) => {
    await services.signIn(email, password);
  }, []);

  const signOutFn = useCallback(async () => {
    await services.signOut();
    setUser(null);
    setClassData(null);
  }, []);

  const isOwner = user?.role === 'owner';
  const isCR = user?.role === 'owner' || user?.role === 'cr';

  return (
    <AuthContext.Provider
      value={{
        user,
        classData,
        loading,
        signIn: signInFn,
        signOut: signOutFn,
        isOwner,
        isCR,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
