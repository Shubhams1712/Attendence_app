// ============================================================
// Shared Types for Attendance Management System
// ============================================================

// --- Supabase Database Types (proper Supabase format) ---
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>;
      };
      classes: {
        Row: Class;
        Insert: Omit<Class, 'id' | 'created_at'>;
        Update: Partial<Omit<Class, 'id' | 'created_at'>>;
      };
      subjects: {
        Row: Subject;
        Insert: Omit<Subject, 'id' | 'created_at'>;
        Update: Partial<Omit<Subject, 'id' | 'created_at'>>;
      };
      teachers: {
        Row: Teacher;
        Insert: Omit<Teacher, 'id' | 'created_at'>;
        Update: Partial<Omit<Teacher, 'id' | 'created_at'>>;
      };
      attendance_records: {
        Row: AttendanceRecord;
        Insert: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>>;
      };
      attendance_sessions: {
        Row: AttendanceSession;
        Insert: Omit<AttendanceSession, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AttendanceSession, 'id' | 'created_at' | 'updated_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'timestamp'>;
        Update: Partial<Omit<AuditLog, 'id' | 'timestamp'>>;
      };
      settings: {
        Row: AppSettings;
        Insert: Omit<AppSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AppSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      notifications: {
        Row: AppNotification;
        Insert: Omit<AppNotification, 'id' | 'created_at'>;
        Update: Partial<Omit<AppNotification, 'id' | 'created_at'>>;
      };
      lecture_timings: {
        Row: LectureTiming;
        Insert: Omit<LectureTiming, 'id'>;
        Update: Partial<Omit<LectureTiming, 'id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// --- Auth & Roles ---
export type UserRole = 'admin' | 'cr' | 'teacher';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// --- Students ---
export type StudentStatus = 'active' | 'inactive' | 'transferred';
export type Gender = 'male' | 'female' | 'other';

export interface Student {
  id: string;
  roll_number: string;
  full_name: string;
  gender: Gender;
  phone?: string;
  email?: string;
  status: StudentStatus;
  class_id: string;
  created_at: string;
  updated_at: string;
}

export interface StudentFormData {
  roll_number: string;
  full_name: string;
  gender: Gender;
  phone?: string;
  email?: string;
  status?: StudentStatus;
}

// --- Classes & Subjects ---
export interface Class {
  id: string;
  name: string;
  department: string;
  semester: number;
  academic_year: string;
  institute_name: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  class_id: string;
  teacher_id?: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  department: string;
  created_at: string;
}

export interface LectureTiming {
  id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  class_id: string;
}

// --- Attendance ---
export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'unmarked';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  session_id: string;
  subject_id: string;
  date: string;
  status: AttendanceStatus;
  marked_by: string;
  marked_at: string;
  edited_by?: string;
  edited_at?: string;
  old_status?: AttendanceStatus;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSession {
  id: string;
  subject_id: string;
  teacher_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  class_id: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  marked_by: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSummary {
  date: string;
  subject_id: string;
  total_students: number;
  present: number;
  absent: number;
  leave: number;
  unmarked: number;
  percentage: number;
}

// --- Audit Logs ---
export interface AuditLog {
  id: string;
  attendance_id: string;
  user_id: string;
  user_name: string;
  action: 'create' | 'update' | 'delete';
  old_value?: AttendanceStatus;
  new_value?: AttendanceStatus;
  timestamp: string;
}

// --- Settings ---
export interface AppSettings {
  id: string;
  institute_name: string;
  department: string;
  class_name: string;
  semester: number;
  academic_year: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  notification_reminder_minutes: number;
  created_at: string;
  updated_at: string;
}

// --- Notifications ---
export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'reminder' | 'alert' | 'info';
  read: boolean;
  created_at: string;
}

// --- Reports ---
export interface ReportFilter {
  start_date: string;
  end_date: string;
  subject_id?: string;
  teacher_id?: string;
  student_id?: string;
  class_id?: string;
}

export interface DailyReport {
  date: string;
  subject: string;
  teacher: string;
  attendance: AttendanceSummary;
  student_details: StudentAttendanceDetail[];
}

export interface StudentAttendanceDetail {
  student_id: string;
  roll_number: string;
  full_name: string;
  status: AttendanceStatus;
  percentage: number;
}

export interface StudentWiseReport {
  student_id: string;
  roll_number: string;
  full_name: string;
  total_classes: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

// --- Offline Sync ---
export interface OfflineRecord {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: string;
  synced: boolean;
}

// --- PWA ---
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
