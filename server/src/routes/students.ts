import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate, authorize } from '../middleware/auth';

export const studentsRouter = Router();

// Get all students
studentsRouter.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { class_id, search, status } = req.query;

    let query = supabase
      .from('students')
      .select('*');

    if (class_id) query = query.eq('class_id', class_id);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,roll_number.ilike.%${search}%`);
    }

    const { data, error } = await query.order('roll_number', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Create student
studentsRouter.post('/', authenticate, authorize('admin', 'cr'), async (req: Request, res: Response) => {
  try {
    const { roll_number, full_name, gender, phone, email, class_id } = req.body;

    const { data, error } = await supabase
      .from('students')
      .insert({ roll_number, full_name, gender, phone, email, class_id })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Update student
studentsRouter.put('/:id', authenticate, authorize('admin', 'cr'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('students')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Delete student
studentsRouter.delete('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Bulk import students
studentsRouter.post('/import', authenticate, authorize('admin', 'cr'), async (req: Request, res: Response) => {
  try {
    const { students, class_id } = req.body;

    const { data, error } = await supabase
      .from('students')
      .insert(
        students.map((s: any) => ({
          ...s,
          class_id,
          status: 'active',
        }))
      )
      .select();

    if (error) throw error;

    res.json({ success: true, data, message: `Imported ${data.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});
