import { supabase } from './supabase';
import type {
  Student, Subject, Faculty, Session, AttendanceRecord,
  AttendanceStatus, AppSetting, Profile, Class, BackupData,
} from '@/types';

// ============================================================
// AUTH
// ============================================================

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

// ============================================================
// CLASS / TENANCY
// ============================================================

export async function getClass(classId: string): Promise<Class | null> {
  const { data } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();
  return data;
}

export async function getUserClasses(userId: string): Promise<Class[]> {
  const { data } = await supabase
    .from('classes')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function updateClass(classId: string, updates: Partial<Class>) {
  const { error } = await supabase
    .from('classes')
    .update(updates)
    .eq('id', classId);
  if (error) throw error;
}

// ============================================================
// STUDENTS
// ============================================================

export async function getStudents(classId: string): Promise<Student[]> {
  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('class_id', classId)
    .order('roll_number', { ascending: true });
  return data || [];
}

export async function getStudentCount(classId: string): Promise<number> {
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', classId);
  return count || 0;
}

export async function addStudent(
  classId: string,
  rollNumber: number,
  name: string,
  notes: string,
  userId: string
): Promise<Student> {
  // Check for duplicate roll number
  const { data: existing } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .eq('roll_number', rollNumber)
    .maybeSingle();
  if (existing) throw new Error(`Student with roll number ${rollNumber} already exists`);

  const { data, error } = await supabase
    .from('students')
    .insert({
      class_id: classId,
      roll_number: rollNumber,
      name,
      notes,
      created_by: userId,
    })
    .select()
    .single();
  if (error) {
    console.error('=== SUPABASE addStudent ERROR ===');
    console.error('Payload:', { classId, rollNumber, name, notes, userId });
    console.error('Error:', error);
    throw error;
  }
  return data;
}

export async function updateStudent(
  studentId: string,
  classId: string,
  rollNumber: number,
  name: string,
  notes: string
): Promise<void> {
  // Check for duplicate roll number (exclude current student)
  const { data: existing } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .eq('roll_number', rollNumber)
    .neq('id', studentId)
    .maybeSingle();
  if (existing) throw new Error(`Student with roll number ${rollNumber} already exists`);

  const { error } = await supabase
    .from('students')
    .update({ roll_number: rollNumber, name, notes, updated_at: new Date().toISOString() })
    .eq('id', studentId);
  if (error) {
    console.error('=== SUPABASE updateStudent ERROR ===');
    console.error('Payload:', { studentId, classId, rollNumber, name, notes });
    console.error('Error:', error);
    throw error;
  }
}

export async function deleteStudent(studentId: string): Promise<void> {
  // Attendance records will cascade delete
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId);
  if (error) {
    console.error('=== SUPABASE deleteStudent ERROR ===');
    console.error('Payload:', { studentId });
    console.error('Error:', error);
    throw error;
  }
}

export async function bulkAddStudents(
  classId: string,
  students: { roll_number: number; name: string; notes?: string }[],
  userId: string
): Promise<void> {
  // Get existing roll numbers
  const { data: existing } = await supabase
    .from('students')
    .select('roll_number')
    .eq('class_id', classId);
  const existingRollNumbers = new Set((existing || []).map(s => s.roll_number));

  const toAdd = students
    .filter(s => !existingRollNumbers.has(s.roll_number))
    .map(s => ({
      class_id: classId,
      roll_number: s.roll_number,
      name: s.name,
      notes: s.notes || '',
      created_by: userId,
    }));

  if (toAdd.length > 0) {
    const { error } = await supabase.from('students').insert(toAdd);
    if (error) {
      console.error('=== SUPABASE bulkAddStudents ERROR ===');
      console.error('Payload:', { classId, count: toAdd.length });
      console.error('Error:', error);
      throw error;
    }
  }
}

// ============================================================
// SUBJECTS
// ============================================================

export async function getSubjects(classId: string): Promise<Subject[]> {
  const { data } = await supabase
    .from('subjects')
    .select('*')
    .eq('class_id', classId)
    .order('name', { ascending: true });
  return data || [];
}

export async function addSubject(classId: string, name: string, userId: string): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .insert({ class_id: classId, name, created_by: userId })
    .select()
    .single();
  if (error) {
    console.error('=== SUPABASE addSubject ERROR ===');
    console.error('Payload:', { classId, name, userId });
    console.error('Error:', error);
    throw error;
  }
  return data;
}

export async function deleteSubject(subjectId: string): Promise<void> {
  const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
  if (error) {
    console.error('=== SUPABASE deleteSubject ERROR ===');
    console.error('Payload:', { subjectId });
    console.error('Error:', error);
    throw error;
  }
}

// ============================================================
// FACULTIES
// ============================================================

export async function getFaculties(classId: string): Promise<Faculty[]> {
  const { data } = await supabase
    .from('faculties')
    .select('*')
    .eq('class_id', classId)
    .order('name', { ascending: true });
  return data || [];
}

export async function addFaculty(classId: string, name: string, userId: string): Promise<Faculty> {
  const { data, error } = await supabase
    .from('faculties')
    .insert({ class_id: classId, name, created_by: userId })
    .select()
    .single();
  if (error) {
    console.error('=== SUPABASE addFaculty ERROR ===');
    console.error('Payload:', { classId, name, userId });
    console.error('Error:', error);
    throw error;
  }
  return data;
}

export async function deleteFaculty(facultyId: string): Promise<void> {
  const { error } = await supabase.from('faculties').delete().eq('id', facultyId);
  if (error) {
    console.error('=== SUPABASE deleteFaculty ERROR ===');
    console.error('Payload:', { facultyId });
    console.error('Error:', error);
    throw error;
  }
}

// ============================================================
// ATTENDANCE SESSIONS
// ============================================================

export async function createSession(
  classId: string,
  date: string,
  time: string,
  subjectId: string,
  facultyId: string,
  lectureNumber: number,
  classroom: string,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .insert({
      class_id: classId,
      date,
      time,
      subject_id: subjectId,
      faculty_id: facultyId,
      lecture_number: lectureNumber,
      classroom,
      created_by: userId,
    })
    .select()
    .single();
  if (error) {
    console.error('=== SUPABASE createSession ERROR ===');
    console.error('Payload:', { classId, date, time, subjectId, facultyId, lectureNumber, classroom, userId });
    console.error('Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    throw error;
  }
  return data.id;
}

export async function getSessions(classId: string): Promise<Session[]> {
  const { data } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const { data } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  return data;
}

export async function getSessionCount(classId: string): Promise<number> {
  const { count } = await supabase
    .from('attendance_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', classId);
  return count || 0;
}

export async function getTodaySessions(classId: string): Promise<Session[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('class_id', classId)
    .eq('date', today)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('attendance_sessions')
    .delete()
    .eq('id', sessionId);
  if (error) throw error;
}

export async function getNextLectureNumber(classId: string): Promise<number> {
  const { data } = await supabase
    .from('attendance_sessions')
    .select('lecture_number')
    .eq('class_id', classId)
    .order('lecture_number', { ascending: false })
    .limit(1);
  if (data && data.length > 0) {
    return (data[0].lecture_number || 0) + 1;
  }
  return 1;
}

// ============================================================
// ATTENDANCE RECORDS
// ============================================================

export async function saveAttendanceRecord(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
  userId: string
): Promise<void> {
  // Check if record exists
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('session_id', sessionId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('attendance_records')
      .update({ status })
      .eq('id', existing.id);
    if (error) {
      console.error('=== SUPABASE saveAttendanceRecord UPDATE ERROR ===');
      console.error('Payload:', { sessionId, studentId, status, userId });
      console.error('Error:', error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from('attendance_records')
      .insert({
        session_id: sessionId,
        student_id: studentId,
        status,
        created_by: userId,
      });
    if (error) {
      console.error('=== SUPABASE saveAttendanceRecord INSERT ERROR ===');
      console.error('Payload:', { sessionId, studentId, status, userId });
      console.error('Error:', error);
      throw error;
    }
  }
}

export async function getAttendanceRecords(sessionId: string): Promise<AttendanceRecord[]> {
  const { data } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('session_id', sessionId);
  return data || [];
}

export async function getAllAttendanceRecords(classId: string): Promise<AttendanceRecord[]> {
  // Get all sessions for this class, then get records
  const sessions = await getSessions(classId);
  if (sessions.length === 0) return [];
  const sessionIds = sessions.map(s => s.id);
  const { data } = await supabase
    .from('attendance_records')
    .select('*')
    .in('session_id', sessionIds);
  return data || [];
}

export async function getSubjectById(subjectId: string): Promise<Subject | null> {
  const { data } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', subjectId)
    .single();
  return data;
}

export async function getFacultyById(facultyId: string): Promise<Faculty | null> {
  const { data } = await supabase
    .from('faculties')
    .select('*')
    .eq('id', facultyId)
    .single();
  return data;
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();
  return data;
}

// ============================================================
// SETTINGS
// ============================================================

export async function getSettings(classId: string): Promise<AppSetting[]> {
  const { data } = await supabase
    .from('app_settings')
    .select('*')
    .eq('class_id', classId);
  return data || [];
}

export async function getSetting(classId: string, key: string): Promise<string | null> {
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('class_id', classId)
    .eq('key', key)
    .maybeSingle();
  return data?.value || null;
}

export async function setSetting(classId: string, key: string, value: string): Promise<void> {
  const { data: existing } = await supabase
    .from('app_settings')
    .select('id')
    .eq('class_id', classId)
    .eq('key', key)
    .maybeSingle();

  if (existing) {
    await supabase.from('app_settings').update({ value }).eq('id', existing.id);
  } else {
    await supabase.from('app_settings').insert({ class_id: classId, key, value });
  }
}

// ============================================================
// BACKUP & RESTORE
// ============================================================

export async function exportBackup(classId: string): Promise<BackupData> {
  const [students, sessions, subjects, faculties, settings] = await Promise.all([
    getStudents(classId),
    getSessions(classId),
    getSubjects(classId),
    getFaculties(classId),
    getSettings(classId),
  ]);

  const records = await getAllAttendanceRecords(classId);

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    students,
    sessions,
    attendanceRecords: records,
    subjects,
    faculty: faculties,
    settings,
  };
}

export async function importBackup(
  classId: string,
  userId: string,
  backup: BackupData
): Promise<void> {
  // Clear existing data
  const sessions = await getSessions(classId);
  for (const session of sessions) {
    await supabase.from('attendance_records').delete().eq('session_id', session.id);
  }
  await supabase.from('attendance_sessions').delete().eq('class_id', classId);
  await supabase.from('students').delete().eq('class_id', classId);
  await supabase.from('subjects').delete().eq('class_id', classId);
  await supabase.from('faculties').delete().eq('class_id', classId);
  await supabase.from('app_settings').delete().eq('class_id', classId);

  // Re-insert data (re-map IDs to avoid conflicts)
  const studentIdMap = new Map<string, string>();
  for (const student of backup.students) {
    const { data } = await supabase
      .from('students')
      .insert({
        class_id: classId,
        roll_number: student.roll_number,
        name: student.name,
        notes: student.notes,
        created_by: userId,
      })
      .select()
      .single();
    if (data) studentIdMap.set(student.id, data.id);
  }

  const subjectIdMap = new Map<string, string>();
  for (const subject of backup.subjects) {
    const { data } = await supabase
      .from('subjects')
      .insert({ class_id: classId, name: subject.name, created_by: userId })
      .select()
      .single();
    if (data) subjectIdMap.set(subject.id, data.id);
  }

  const facultyIdMap = new Map<string, string>();
  for (const fac of backup.faculty) {
    const { data } = await supabase
      .from('faculties')
      .insert({ class_id: classId, name: fac.name, created_by: userId })
      .select()
      .single();
    if (data) facultyIdMap.set(fac.id, data.id);
  }

  const sessionIdMap = new Map<string, string>();
  for (const session of backup.sessions) {
    const newSubjectId = subjectIdMap.get(session.subject_id) || session.subject_id;
    const newFacultyId = facultyIdMap.get(session.faculty_id) || session.faculty_id;
    const { data } = await supabase
      .from('attendance_sessions')
      .insert({
        class_id: classId,
        date: session.date,
        time: session.time,
        subject_id: newSubjectId,
        faculty_id: newFacultyId,
        lecture_number: session.lecture_number,
        classroom: session.classroom,
        created_by: userId,
      })
      .select()
      .single();
    if (data) sessionIdMap.set(session.id, data.id);
  }

  for (const record of backup.attendanceRecords) {
    const newSessionId = sessionIdMap.get(record.session_id);
    const newStudentId = studentIdMap.get(record.student_id);
    if (newSessionId && newStudentId) {
      await supabase.from('attendance_records').insert({
        session_id: newSessionId,
        student_id: newStudentId,
        status: record.status,
        created_by: userId,
      });
    }
  }

  for (const setting of backup.settings) {
    await setSetting(classId, setting.key, setting.value);
  }
}

export async function resetDatabase(classId: string): Promise<void> {
  const sessions = await getSessions(classId);
  for (const session of sessions) {
    await supabase.from('attendance_records').delete().eq('session_id', session.id);
  }
  await supabase.from('attendance_sessions').delete().eq('class_id', classId);
  await supabase.from('students').delete().eq('class_id', classId);
  await supabase.from('subjects').delete().eq('class_id', classId);
  await supabase.from('faculties').delete().eq('class_id', classId);
  await supabase.from('app_settings').delete().eq('class_id', classId);
}

// ============================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================

export function subscribeToTable(
  table: string,
  filter: { column: string; value: string },
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: `${filter.column}=eq.${filter.value}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}
