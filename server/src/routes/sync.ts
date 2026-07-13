import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';

export const syncRouter = Router();

// Sync offline records
syncRouter.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { table, action, data, id: offlineId } = req.body;

    let result;

    switch (action) {
      case 'insert':
        result = await supabase.from(table).insert(data).select().single();
        break;
      case 'update':
        result = await supabase.from(table).update(data).eq('id', data.id).select().single();
        break;
      case 'delete':
        result = await supabase.from(table).delete().eq('id', data.id);
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    if (result?.error) throw result.error;

    res.json({ success: true, data: result?.data, offlineId });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Batch sync
syncRouter.post('/batch', authenticate, async (req: Request, res: Response) => {
  try {
    const { records } = req.body;
    const results = [];

    for (const record of records) {
      try {
        let result;
        switch (record.action) {
          case 'insert':
            result = await supabase.from(record.table).insert(record.data).select().single();
            break;
          case 'update':
            result = await supabase.from(record.table).update(record.data).eq('id', record.data.id).select().single();
            break;
          case 'delete':
            result = await supabase.from(record.table).delete().eq('id', record.data.id);
            break;
        }
        results.push({ id: record.id, success: true });
      } catch {
        results.push({ id: record.id, success: false });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});
