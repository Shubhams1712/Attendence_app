-- ============================================================
-- Attendance Register - Complete Supabase Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Users (managed by Supabase Auth, this is just a profile table)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cr' CHECK (role IN ('owner', 'cr')),
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'My Class',
  academic_year TEXT NOT NULL DEFAULT '',
  semester TEXT NOT NULL DEFAULT '1',
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  roll_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, roll_number)
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Faculties
CREATE TABLE IF NOT EXISTS faculties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance Sessions
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  lecture_number INTEGER NOT NULL,
  classroom TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'medical', 'holiday')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- App Settings
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  UNIQUE(class_id, key)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_roll ON students(class_id, roll_number);
CREATE INDEX IF NOT EXISTS idx_sessions_class ON attendance_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON attendance_sessions(date);
CREATE INDEX IF NOT EXISTS idx_records_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_subjects_class ON subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_faculties_class ON faculties(class_id);
CREATE INDEX IF NOT EXISTS idx_settings_class ON app_settings(class_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Classes: authenticated users can CRUD their own classes
CREATE POLICY "classes_select_own" ON classes
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

CREATE POLICY "classes_insert_own" ON classes
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "classes_update_own" ON classes
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "classes_delete_own" ON classes
  FOR DELETE USING (auth.uid() = owner_id);

-- Students: authenticated users can CRUD students in their class
CREATE POLICY "students_select" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND (classes.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr')))
    )
  );

CREATE POLICY "students_insert" ON students
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

CREATE POLICY "students_update" ON students
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

CREATE POLICY "students_delete" ON students
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

-- Subjects: authenticated users can CRUD subjects in their class
CREATE POLICY "subjects_select" ON subjects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = subjects.class_id AND (classes.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))))
  );

CREATE POLICY "subjects_insert" ON subjects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

CREATE POLICY "subjects_delete" ON subjects
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

-- Faculties: same pattern
CREATE POLICY "faculties_select" ON faculties
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = faculties.class_id AND (classes.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))))
  );

CREATE POLICY "faculties_insert" ON faculties
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

CREATE POLICY "faculties_delete" ON faculties
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

-- Attendance Sessions: authenticated users can CRUD
CREATE POLICY "sessions_select" ON attendance_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = attendance_sessions.class_id AND (classes.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))))
  );

CREATE POLICY "sessions_insert" ON attendance_sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

CREATE POLICY "sessions_delete" ON attendance_sessions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

-- Attendance Records: authenticated users can CRUD
CREATE POLICY "records_select" ON attendance_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM attendance_sessions JOIN classes ON classes.id = attendance_sessions.class_id WHERE attendance_sessions.id = attendance_records.session_id AND (classes.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))))
  );

CREATE POLICY "records_insert" ON attendance_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

CREATE POLICY "records_update" ON attendance_records
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

CREATE POLICY "records_delete" ON attendance_records
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

-- App Settings: authenticated users can CRUD
CREATE POLICY "settings_select" ON app_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = app_settings.class_id AND (classes.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))))
  );

CREATE POLICY "settings_insert" ON app_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

CREATE POLICY "settings_update" ON app_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

CREATE POLICY "settings_delete" ON app_settings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'cr'))
  );

-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'cr'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-create a default class for new users
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.classes (name, academic_year, semester, owner_id)
  VALUES ('My Class', '', '1', NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();
