import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';

/**
 * Get user profile by ID
 */
export async function getProfileById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as User;
}

/**
 * Get current user's profile
 */
export async function getCurrentProfile(): Promise<User | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error) throw error;
  return data as User;
}

/**
 * Update user profile
 */
export async function updateProfile(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(user: User | null, ...roles: UserRole[]): boolean {
  return user ? roles.includes(user.role) : false;
}
