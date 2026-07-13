import { supabase } from '@/lib/supabase';
import type { AttendanceSession } from '@/types';

/**
 * Create a new attendance session (lecture)
 */
export async function createSession(
  data: Omit<AttendanceSession, 'id' | 'created_at' | 'updated_at'>
): Promise<AttendanceSession> {
  const { data: session, error } = await supabase
    .from('attendance_sessions')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return session as AttendanceSession;
}

/**
 * Get session by ID
 */
export async function getSessionById(id: string): Promise<AttendanceSession | null> {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as AttendanceSession;
}

/**
 * Get today's sessions for a class
 */
export async function getTodaySessions(classId: string): Promise<AttendanceSession[]> {
  const today = new Date().toISOString().split('T')[0] || '';

  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('class_id', classId)
    .eq('date', today)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data as AttendanceSession[];
}

/**
 * Get sessions for a date range
 */
export async function getSessionsByDateRange(
  classId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceSession[]> {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('class_id', classId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data as AttendanceSession[];
}

/**
 * Complete a session
 */
export async function completeSession(id: string): Promise<AttendanceSession> {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .update({ status: 'completed' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AttendanceSession;
}

/**
 * Cancel a session
 */
export async function cancelSession(id: string): Promise<AttendanceSession> {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AttendanceSession;
}

/**
 * Get all sessions with subject and teacher info for history
 */
export async function getSessionsWithDetails(
  classId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AttendanceSession[]> {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('class_id', classId)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as AttendanceSession[];
}
