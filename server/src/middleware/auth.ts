import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new Error('No authorization token'));
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return next(new Error('Invalid token'));
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return next(new Error('Not authenticated'));
    }

    const userRole = user.user_metadata?.role || user.role;
    if (roles.length > 0 && !roles.includes(userRole)) {
      return next(new Error('Insufficient permissions'));
    }

    next();
  };
}
