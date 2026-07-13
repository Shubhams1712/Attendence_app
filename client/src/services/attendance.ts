import { supabase } from '@/lib/supabase';
import type { AttendanceRecord, AttendanceStatus, AttendanceSummary } from '@/types';

/**
 * Get all attendance records for a given session
 */
export async function getAttendanceBySession(sessionId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as AttendanceRecord[];
}

/**
 * Get attendance records for a student across sessions
 */
export async function getAttendanceByStudent(
  studentId: string,
  startDate?: string,
  endDate?: string
): Promise<AttendanceRecord[]> {
  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false });

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data as AttendanceRecord[];
}

/**
 * Get attendance records for a date range and optional subject
 */
export async function getAttendanceByDateRange(
  startDate: string,
  endDate: string,
  subjectId?: string
): Promise<AttendanceRecord[]> {
  let query = supabase
    .from('attendance_records')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as AttendanceRecord[];
}

/**
 * Mark or update attendance for a single student
 */
export async function markAttendance(
  sessionId: string,
  studentId: string,
  subjectId: string,
  date: string,
  status: AttendanceStatus,
  markedBy: string
): Promise<AttendanceRecord | null> {
  if (status === 'unmarked') {
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .eq('session_id', sessionId)
      .eq('student_id', studentId);

    if (error) throw error;
    return null;
  }

  // Check if record exists
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('id, status')
    .eq('session_id', sessionId)
    .eq('student_id', studentId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('attendance_records')
      .update({
        status,
        edited_by: markedBy,
        edited_at: new Date().toISOString(),
        old_status: existing.status,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data as AttendanceRecord;
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      student_id: studentId,
      session_id: sessionId,
      subject_id: subjectId,
      date,
      status,
      marked_by: markedBy,
      marked_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as AttendanceRecord;
}

/**
 * Bulk mark attendance for all students in a session
 */
export async function bulkMarkAttendance(
  sessionId: string,
  subjectId: string,
  date: string,
  records: { student_id: string; status: AttendanceStatus }[],
  markedBy: string
): Promise<void> {
  const inserts: Record<string, unknown>[] = [];
  const updates: { id: string; data: Record<string, unknown> }[] = [];

  const { data: existingRecords } = await supabase
    .from('attendance_records')
    .select('id, student_id, status')
    .eq('session_id', sessionId);

  const existingMap = new Map(
    (existingRecords as { id: string; student_id: string; status: string }[] | null)?.map((r) => [r.student_id, r]) ?? []
  );

  for (const record of records) {
    if (record.status === 'unmarked') {
      const existing = existingMap.get(record.student_id);
      if (existing) {
        await supabase.from('attendance_records').delete().eq('id', existing.id);
      }
      continue;
    }

    const existing = existingMap.get(record.student_id);
    if (existing) {
      updates.push({
        id: existing.id,
        data: {
          status: record.status,
          edited_by: markedBy,
          edited_at: new Date().toISOString(),
          old_status: existing.status,
        },
      });
    } else {
      inserts.push({
        student_id: record.student_id,
        session_id: sessionId,
        subject_id: subjectId,
        date,
        status: record.status,
        marked_by: markedBy,
        marked_at: new Date().toISOString(),
      });
    }
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from('attendance_records').insert(inserts);
    if (error) throw error;
  }

  for (const update of updates) {
    const { error } = await supabase
      .from('attendance_records')
      .update(update.data)
      .eq('id', update.id);
    if (error) throw error;
  }
}

/**
 * Calculate attendance summary for a session
 */
export async function getSessionSummary(
  sessionId: string,
  totalStudents: number
): Promise<AttendanceSummary> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('status')
    .eq('session_id', sessionId);

  if (error) throw error;

  const records = (data as { status: string }[]) || [];
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const leave = records.filter((r) => r.status === 'leave').length;
  const unmarked = totalStudents - records.length;
  const percentage = totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0;

  return {
    date: '',
    subject_id: '',
    total_students: totalStudents,
    present,
    absent,
    leave,
    unmarked,
    percentage,
  };
}

/**
 * Get student attendance percentage over a date range
 */
export async function getStudentAttendancePercentage(
  studentId: string,
  startDate: string,
  endDate: string
): Promise<{ total: number; present: number; percentage: number }> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('status')
    .eq('student_id', studentId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  const records = (data as { status: string }[]) || [];
  const total = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return { total, present, percentage };
}
