import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';

export const reportsRouter = Router();

// Generate daily report
reportsRouter.get('/daily', authenticate, async (req: Request, res: Response) => {
  try {
    const { date, subject_id } = req.query;

    const { data: attendance, error } = await supabase
      .from('attendance')
      .select(`
        *,
        students (roll_number, full_name, gender),
        subjects (name, code),
        profiles!attendance_marked_by_fkey (full_name)
      `)
      .eq('date', date)
      .eq('subject_id', subject_id);

    if (error) throw error;

    const total = attendance?.length || 0;
    const present = attendance?.filter(a => a.status === 'present').length || 0;
    const absent = attendance?.filter(a => a.status === 'absent').length || 0;
    const leave = attendance?.filter(a => a.status === 'leave').length || 0;

    res.json({
      success: true,
      data: {
        date,
        subject: attendance?.[0]?.subjects,
        teacher: attendance?.[0]?.profiles,
        summary: { total, present, absent, leave, percentage: total > 0 ? Math.round((present / total) * 100) : 0 },
        records: attendance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Student-wise report
reportsRouter.get('/student-wise', authenticate, async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, student_id } = req.query;

    const { data: attendance, error } = await supabase
      .from('attendance')
      .select('status, date, students (roll_number, full_name)')
      .gte('date', start_date)
      .lte('date', end_date)
      .eq('student_id', student_id);

    if (error) throw error;

    const total = attendance?.length || 0;
    const present = attendance?.filter(a => a.status === 'present').length || 0;
    const absent = attendance?.filter(a => a.status === 'absent').length || 0;
    const leave = attendance?.filter(a => a.status === 'leave').length || 0;

    res.json({
      success: true,
      data: {
        student: attendance?.[0]?.students,
        total_classes: total,
        present,
        absent,
        leave,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Audit log
reportsRouter.get('/audit-log', authenticate, async (req: Request, res: Response) => {
  try {
    const { date, student_id } = req.query;

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        profiles!audit_logs_user_id_fkey (full_name)
      `)
      .order('timestamp', { ascending: false });

    if (date) query = query.eq('date', date);
    if (student_id) query = query.eq('student_id', student_id);

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});
