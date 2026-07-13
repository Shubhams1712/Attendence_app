-- ============================================================
-- ClassAttend - Sample Data (Seed)
-- Run this AFTER running schema.sql
-- ============================================================
-- NOTE: You need to create at least one user in Supabase Auth first!
-- Go to: Authentication → Users → Add user
-- Then replace 'YOUR_USER_UUID_HERE' below with that user's ID.
-- You can find the UUID in: Authentication → Users → click on the user

-- ============================================================
-- STEP 1: Create a Class
-- ============================================================
INSERT INTO classes (id, name, department, semester, academic_year, institute_name)
VALUES (
  '1',
  'BSc IT Third Year',
  'Computer Science',
  6,
  '2025-2026',
  'ABC College of Technology'
);

-- ============================================================
-- STEP 2: Create Subjects
-- ============================================================
INSERT INTO subjects (id, name, code, class_id) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Data Structures', 'CS301', '1'),
  ('00000000-0000-0000-0000-000000000012', 'Operating Systems', 'CS302', '1'),
  ('00000000-0000-0000-0000-000000000013', 'Database Management', 'CS303', '1'),
  ('00000000-0000-0000-0000-000000000014', 'Computer Networks', 'CS304', '1'),
  ('00000000-0000-0000-0000-000000000015', 'Software Engineering', 'CS305', '1'),
  ('00000000-0000-0000-0000-000000000016', 'Web Development', 'CS306', '1');

-- ============================================================
-- STEP 3: Create Teachers
-- ============================================================
INSERT INTO teachers (id, full_name, email, phone, department) VALUES
  ('00000000-0000-0000-0000-000000000021', 'Dr. Priya Sharma', 'priya.sharma@college.edu', '+91 98765 43210', 'Computer Science'),
  ('00000000-0000-0000-0000-000000000022', 'Prof. Rajesh Kumar', 'rajesh.kumar@college.edu', '+91 98765 43211', 'Computer Science'),
  ('00000000-0000-0000-0000-000000000023', 'Dr. Anita Desai', 'anita.desai@college.edu', '+91 98765 43212', 'Computer Science');

-- ============================================================
-- STEP 4: Create Students (30 students)
-- ============================================================
INSERT INTO students (roll_number, full_name, gender, phone, status, class_id) VALUES
  ('001', 'Aarav Patel', 'male', '+91 98765 43301', 'active', '1'),
  ('002', 'Priya Sharma', 'female', '+91 98765 43302', 'active', '1'),
  ('003', 'Rohan Gupta', 'male', '+91 98765 43303', 'active', '1'),
  ('004', 'Ananya Singh', 'female', '+91 98765 43304', 'active', '1'),
  ('005', 'Vikram Desai', 'male', '+91 98765 43305', 'active', '1'),
  ('006', 'Meera Joshi', 'female', '+91 98765 43306', 'active', '1'),
  ('007', 'Arjun Reddy', 'male', '+91 98765 43307', 'active', '1'),
  ('008', 'Kavya Nair', 'female', '+91 98765 43308', 'active', '1'),
  ('009', 'Aditya Kumar', 'male', '+91 98765 43309', 'active', '1'),
  ('010', 'Diya Mehta', 'female', '+91 98765 43310', 'active', '1'),
  ('011', 'Karan Malhotra', 'male', '+91 98765 43311', 'active', '1'),
  ('012', 'Nisha Verma', 'female', '+91 98765 43312', 'active', '1'),
  ('013', 'Siddharth Rao', 'male', '+91 98765 43313', 'active', '1'),
  ('014', 'Pooja Iyer', 'female', '+91 98765 43314', 'active', '1'),
  ('015', 'Rahul Bose', 'male', '+91 98765 43315', 'active', '1'),
  ('016', 'Shreya Chopra', 'female', '+91 98765 43316', 'active', '1'),
  ('017', 'Varun Sinha', 'male', '+91 98765 43317', 'active', '1'),
  ('018', 'Tanvi Bhat', 'female', '+91 98765 43318', 'active', '1'),
  ('019', 'Nikhil Agarwal', 'male', '+91 98765 43319', 'active', '1'),
  ('020', 'Riya Kulkarni', 'female', '+91 98765 43320', 'active', '1'),
  ('021', 'Amit Tiwari', 'male', '+91 98765 43321', 'active', '1'),
  ('022', 'Sneha Pillai', 'female', '+91 98765 43322', 'active', '1'),
  ('023', 'Deepak Menon', 'male', '+91 98765 43323', 'active', '1'),
  ('024', 'Aisha Khan', 'female', '+91 98765 43324', 'active', '1'),
  ('025', 'Rajat Saxena', 'male', '+91 98765 43325', 'active', '1'),
  ('026', 'Megha Joshi', 'female', '+91 98765 43326', 'active', '1'),
  ('027', 'Kunal Bhatt', 'male', '+91 98765 43327', 'active', '1'),
  ('028', 'Nandini Reddy', 'female', '+91 98765 43328', 'active', '1'),
  ('029', 'Tarun Mishra', 'male', '+91 98765 43329', 'active', '1'),
  ('030', 'Ishita Das', 'female', '+91 98765 43330', 'active', '1');

-- ============================================================
-- STEP 5: Create App Settings
-- ============================================================
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
);

-- ============================================================
-- STEP 6: Create Sample Lecture Timings
-- ============================================================
INSERT INTO lecture_timings (subject_id, teacher_id, day_of_week, start_time, end_time, class_id) VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000021', 1, '09:00', '10:00', '1'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000022', 1, '10:00', '11:00', '1'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000023', 2, '09:00', '10:00', '1'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000021', 2, '10:00', '11:00', '1'),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000022', 3, '09:00', '10:00', '1'),
  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000023', 3, '10:00', '11:00', '1'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000021', 4, '09:00', '10:00', '1'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000023', 4, '10:00', '11:00', '1'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000022', 5, '09:00', '10:00', '1'),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000022', 5, '10:00', '11:00', '1');

-- ============================================================
-- DONE! 🎉
-- ============================================================
-- You now have:
-- ✅ 1 class (BSc IT Third Year)
-- ✅ 6 subjects
-- ✅ 3 teachers
-- ✅ 30 students
-- ✅ 1 settings record
-- ✅ 10 lecture timings (Mon-Fri schedule)
--
-- Next steps:
-- 1. Create a user in Authentication → Users
-- 2. Update that user's profile role to 'admin' or 'cr'
--    (Run this SQL, replacing UUID with your user ID):
--
--    UPDATE profiles SET role = 'cr' WHERE id = 'YOUR_USER_UUID_HERE';
--
-- 3. Run the app: cd client && npm run dev
-- 4. Login with your user credentials
