import { supabase } from '@/lib/supabase';
import type { AppSettings } from '@/types';

/**
 * Get app settings (singleton pattern — first row)
 */
export async function getSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as AppSettings | null;
}

/**
 * Create or update settings
 */
export async function upsertSettings(settings: Partial<Omit<AppSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<AppSettings> {
  const existing = await getSettings();

  if (existing) {
    const { data, error } = await supabase
      .from('settings')
      .update(settings)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data as AppSettings;
  }

  const { data, error } = await supabase
    .from('settings')
    .insert({
      institute_name: settings.institute_name || '',
      department: settings.department || '',
      class_name: settings.class_name || '',
      semester: settings.semester || 1,
      academic_year: settings.academic_year || '',
      theme: settings.theme || 'system',
      notifications_enabled: settings.notifications_enabled ?? true,
      notification_reminder_minutes: settings.notification_reminder_minutes || 10,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AppSettings;
}
