// ============================================================
// Shared Types for Attendance Management System
// ============================================================

// --- Supabase Database Types (placeholder) ---
export interface Database {
  public: {
    Tables: {
      profiles: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      students: { Row: Student; Insert: Partial<Student>; Update: Partial<Student> };
      classes: { Row: Class; Insert: Partial<Class>; Update: Partial<Class> };
      subjects: { Row: Subject; Insert: Partial<Subject>; Update: Partial<Subject> };
      teachers: { Row: Teacher; Insert: Partial<Teacher>; Update: Partial<Teacher> };
      attendance: { Row: AttendanceRecord; Insert: Partial<AttendanceRecord>; Update: Partial<AttendanceRecord> };
      attendance_sessions: { Row: AttendanceSession; Insert: Partial<AttendanceSession>; Update: Partial<AttendanceSession> };
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: Partial<AuditLog> };
      settings: { Row: AppSettings; Insert: Partial<AppSettings>; Update: Partial<AppSettings> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      lecture_timings: { Row: LectureTiming; Insert: Partial<LectureTiming>; Update: Partial<LectureTiming> };
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

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
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
  status: StudentStatus;
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
  teacher_id: string;
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
export interface Notification {
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

// --- API Responses ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
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
