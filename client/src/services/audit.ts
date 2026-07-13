import { supabase } from '@/lib/supabase';
import type { AuditLog, AttendanceStatus } from '@/types';

/**
 * Create an audit log entry
 */
export async function createAuditLog(log: {
  attendance_id: string;
  user_id: string;
  user_name: string;
  action: 'create' | 'update' | 'delete';
  old_value?: AttendanceStatus;
  new_value?: AttendanceStatus;
}): Promise<void> {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      attendance_id: log.attendance_id,
      user_id: log.user_id,
      user_name: log.user_name,
      action: log.action,
      old_value: log.old_value,
      new_value: log.new_value,
      timestamp: new Date().toISOString(),
    });

  if (error) throw error;
}

/**
 * Get audit logs for an attendance record
 */
export async function getAuditLogs(attendanceId: string): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('attendance_id', attendanceId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data as AuditLog[];
}

/**
 * Get audit logs for a date range
 */
export async function getAuditLogsByDateRange(
  startDate: string,
  endDate: string
): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data as AuditLog[];
}
