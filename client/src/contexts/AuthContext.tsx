import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet (trigger hasn't fired). Create a minimal one.
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            full_name: (authUser.user_metadata as Record<string, string>)?.full_name || authUser.email || 'User',
            role: ((authUser.user_metadata as Record<string, string>)?.role as UserRole) || 'cr',
            created_at: authUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        setUser(data as User);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      return {};
    } catch {
      return { error: 'Failed to sign in' };
    }
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ) => {
    try {
      // The trigger handle_new_user() in Supabase automatically creates
      // a profile row when a new user signs up. We just need to pass
      // full_name and role in the metadata.
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch {
      return { error: 'Failed to sign up' };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) return { error: error.message };
      return {};
    } catch {
      return { error: 'Failed to send reset email' };
    }
  }, []);

  const hasRole = useCallback((...roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
