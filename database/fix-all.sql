-- ============================================================
-- CLASSATTEND - COMPLETE FIX SQL
-- Run this in Supabase SQL Editor to fix all issues
-- ============================================================
-- This script:
-- 1. Disables email confirmation (so you can sign up immediately)
-- 2. Fixes RLS policies (adds missing INSERT policy for profiles)
-- 3. Inserts seed data (class, subjects, students)
-- 4. Creates a default admin settings row
-- ============================================================

-- STEP 1: Disable email confirmation (run this first!)
-- This allows sign-up without email verification
UPDATE auth.config
SET email_confirm = false;

-- STEP 2: Add INSERT policy for profiles table
-- The trigger creates profiles automatically, but we need a backup policy
-- in case the trigger fails or you need to create profiles manually
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
CREATE POLICY "System can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- STEP 3: Make sure the profiles trigger works
-- This ensures every new auth user gets a profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cr')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Insert seed data (safe to run multiple times)
-- Class
INSERT INTO classes (id, name, department, semester, academic_year, institute_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'BSc IT Third Year',
  'Computer Science',
  6,
  '2025-2026',
  'ABC College of Technology'
)
ON CONFLICT (id) DO NOTHING;

-- Subjects
INSERT INTO subjects (id, name, code, class_id) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Data Structures', 'CS301', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000012', 'Operating Systems', 'CS302', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000013', 'Database Management', 'CS303', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000014', 'Computer Networks', 'CS304', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000015', 'Software Engineering', 'CS305', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000016', 'Web Development', 'CS306', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Students (30 students)
INSERT INTO students (roll_number, full_name, gender, phone, status, class_id) VALUES
  ('001', 'Aarav Patel', 'male', '+91 98765 43301', 'active', '00000000-0000-0000-0000-000000000001'),
  ('002', 'Priya Sharma', 'female', '+91 98765 43302', 'active', '00000000-0000-0000-0000-000000000001'),
  ('003', 'Rohan Gupta', 'male', '+91 98765 43303', 'active', '00000000-0000-0000-0000-000000000001'),
  ('004', 'Ananya Singh', 'female', '+91 98765 43304', 'active', '00000000-0000-0000-0000-000000000001'),
  ('005', 'Vikram Desai', 'male', '+91 98765 43305', 'active', '00000000-0000-0000-0000-000000000001'),
  ('006', 'Meera Joshi', 'female', '+91 98765 43306', 'active', '00000000-0000-0000-0000-000000000001'),
  ('007', 'Arjun Reddy', 'male', '+91 98765 43307', 'active', '00000000-0000-0000-0000-000000000001'),
  ('008', 'Kavya Nair', 'female', '+91 98765 43308', 'active', '00000000-0000-0000-0000-000000000001'),
  ('009', 'Aditya Kumar', 'male', '+91 98765 43309', 'active', '00000000-0000-0000-0000-000000000001'),
  ('010', 'Diya Mehta', 'female', '+91 98765 43310', 'active', '00000000-0000-0000-0000-000000000001'),
  ('011', 'Karan Malhotra', 'male', '+91 98765 43311', 'active', '00000000-0000-0000-0000-000000000001'),
  ('012', 'Nisha Verma', 'female', '+91 98765 43312', 'active', '00000000-0000-0000-0000-000000000001'),
  ('013', 'Siddharth Rao', 'male', '+91 98765 43313', 'active', '00000000-0000-0000-0000-000000000001'),
  ('014', 'Pooja Iyer', 'female', '+91 98765 43314', 'active', '00000000-0000-0000-0000-000000000001'),
  ('015', 'Rahul Bose', 'male', '+91 98765 43315', 'active', '00000000-0000-0000-0000-000000000001'),
  ('016', 'Shreya Chopra', 'female', '+91 98765 43316', 'active', '00000000-0000-0000-0000-000000000001'),
  ('017', 'Varun Sinha', 'male', '+91 98765 43317', 'active', '00000000-0000-0000-0000-000000000001'),
  ('018', 'Tanvi Bhat', 'female', '+91 98765 43318', 'active', '00000000-0000-0000-0000-000000000001'),
  ('019', 'Nikhil Agarwal', 'male', '+91 98765 43319', 'active', '00000000-0000-0000-0000-000000000001'),
  ('020', 'Riya Kulkarni', 'female', '+91 98765 43320', 'active', '00000000-0000-0000-0000-000000000001'),
  ('021', 'Amit Tiwari', 'male', '+91 98765 43321', 'active', '00000000-0000-0000-0000-000000000001'),
  ('022', 'Sneha Pillai', 'female', '+91 98765 43322', 'active', '00000000-0000-0000-0000-000000000001'),
  ('023', 'Deepak Menon', 'male', '+91 98765 43323', 'active', '00000000-0000-0000-0000-000000000001'),
  ('024', 'Aisha Khan', 'female', '+91 98765 43324', 'active', '00000000-0000-0000-0000-000000000001'),
  ('025', 'Rajat Saxena', 'male', '+91 98765 43325', 'active', '00000000-0000-0000-0000-000000000001'),
  ('026', 'Megha Joshi', 'female', '+91 98765 43326', 'active', '00000000-0000-0000-0000-000000000001'),
  ('027', 'Kunal Bhatt', 'male', '+91 98765 43327', 'active', '00000000-0000-0000-0000-000000000001'),
  ('028', 'Nandini Reddy', 'female', '+91 98765 43328', 'active', '00000000-0000-0000-0000-000000000001'),
  ('029', 'Tarun Mishra', 'male', '+91 98765 43329', 'active', '00000000-0000-0000-0000-000000000001'),
  ('030', 'Ishita Das', 'female', '+91 98765 43330', 'active', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Settings
INSERT INTO settings (institute_name, department, class_name, semester, academic_year, theme, notifications_enabled, notification_reminder_minutes)
VALUES (
  'ABC College of Technology',
  'Computer Science',
  'BSc IT Third Year',
  6,
  '2025-2026',
  'system',
  true,
  10
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE! After running this:
-- 1. Create a user in Supabase > Authentication > Users > Add user
--    Email: admin@classattend.com
--    Password: admin123
-- 2. Go to Vercel > Settings > Environment Variables
--    Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
-- 3. Redeploy from Vercel
-- 4. Open the app and sign in with admin@classattend.com / admin123
-- ============================================================
