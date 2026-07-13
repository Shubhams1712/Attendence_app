import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate, authorize } from '../middleware/auth';

export const attendanceRouter = Router();

// Get attendance for a specific date and subject
attendanceRouter.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { date, subject_id } = req.query;

    let query = supabase
      .from('attendance')
      .select(`
        *,
        students (roll_number, full_name),
        subjects (name, code)
      `);

    if (date) query = query.eq('date', date);
    if (subject_id) query = query.eq('subject_id', subject_id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Mark or update attendance
attendanceRouter.post('/', authenticate, authorize('admin', 'cr'), async (req: Request, res: Response) => {
  try {
    const { student_id, subject_id, date, status } = req.body;
    const user = (req as any).user;

    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        student_id,
        subject_id,
        date,
        status,
        marked_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id,subject_id,date' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Bulk mark attendance
attendanceRouter.post('/bulk', authenticate, authorize('admin', 'cr'), async (req: Request, res: Response) => {
  try {
    const { records } = req.body;
    const user = (req as any).user;

    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        records.map((r: any) => ({
          ...r,
          marked_by: user.id,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'student_id,subject_id,date' }
      )
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get attendance summary for a date
attendanceRouter.get('/summary', authenticate, async (req: Request, res: Response) => {
  try {
    const { date, subject_id } = req.query;

    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('status', 'active');

    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', date)
      .eq('subject_id', subject_id);

    const total = students?.length || 0;
    const present = attendance?.filter(a => a.status === 'present').length || 0;
    const absent = attendance?.filter(a => a.status === 'absent').length || 0;
    const leave = attendance?.filter(a => a.status === 'leave').length || 0;

    res.json({
      success: true,
      data: {
        total,
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
