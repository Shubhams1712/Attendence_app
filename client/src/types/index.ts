export interface Student {
  id: string;
  class_id: string;
  roll_number: number;
  name: string;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  class_id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface Faculty {
  id: string;
  class_id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'medical' | 'holiday';

export interface Session {
  id: string;
  class_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  subject_id: string;
  faculty_id: string;
  lecture_number: number;
  classroom: string;
  created_by: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  created_by: string;
  created_at: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  medical: number;
  holiday: number;
}

export interface AppSetting {
  id: string;
  class_id: string;
  key: string;
  value: string;
}

export interface Profile {
  id: string;
  email: string;
  role: 'owner' | 'cr';
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  academic_year: string;
  semester: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  students: Student[];
  sessions: Session[];
  attendanceRecords: AttendanceRecord[];
  subjects: Subject[];
  faculty: Faculty[];
  settings: AppSetting[];
}
