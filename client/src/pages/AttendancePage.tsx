import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Users,
  Filter,
  ArrowUpDown,
  Save,
  Share2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs } from '@/components/ui/Tabs';
import { useStudents } from '@/hooks/useStudents';
import { useMarkAttendance, useBulkMarkAttendance } from '@/hooks/useAttendance';
import { useCreateSession, useCompleteSession } from '@/hooks/useSessions';
import { useAuth } from '@/contexts/AuthContext';
import { useOffline } from '@/contexts/OfflineContext';
import { supabase } from '@/lib/supabase';
import type { AttendanceStatus, Student, AttendanceRecord } from '@/types';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const DEFAULT_CLASS_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_SUBJECT_ID = '00000000-0000-0000-0000-000000000011';
// teacher_id references profiles(id), not teachers table — use NULL until a teacher profile exists

type SortMode = 'roll' | 'name';
type FilterMode = 'all' | 'present' | 'absent' | 'leave' | 'unmarked';

const statusCycle: AttendanceStatus[] = ['present', 'absent', 'leave', 'unmarked'];
const statusConfig: Record<AttendanceStatus, { color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  present: { color: 'text-success-600', bg: 'bg-success-50 dark:bg-success-500/10', border: 'border-success-400', icon: CheckCircle },
  absent: { color: 'text-danger-600', bg: 'bg-danger-50 dark:bg-danger-500/10', border: 'border-danger-400', icon: XCircle },
  leave: { color: 'text-warning-600', bg: 'bg-warning-50 dark:bg-warning-500/10', border: 'border-warning-400', icon: Clock },
  unmarked: { color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', icon: Users },
};

interface StudentWithAttendance extends Student {
  attendance: AttendanceStatus;
}

export function AttendancePage() {
  const { user } = useAuth();
  const { isOnline, saveOffline } = useOffline();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('roll');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [tappingId, setTappingId] = useState<string | null>(null);

  const { data: students = [] } = useStudents(DEFAULT_CLASS_ID);
  const createSession = useCreateSession();
  const completeSession = useCompleteSession();
  const markAttendanceMutation = useMarkAttendance();
  const bulkMarkAttendance = useBulkMarkAttendance();

  // Build attendance map from existing records
  const [attendanceMap, setAttendanceMap] = useState<Map<string, AttendanceStatus>>(new Map());

  // Fetch existing records for today's session
  useEffect(() => {
    const fetchRecords = async () => {
      if (!sessionId) return;

      const { data: records } = await supabase
        .from('attendance_records')
        .select('student_id, status')
        .eq('session_id', sessionId);

      if (records) {
        const map = new Map<string, AttendanceStatus>();
        records.forEach((r) => map.set(r.student_id, r.status as AttendanceStatus));
        setAttendanceMap(map);
      }
    };

    fetchRecords();
  }, [sessionId]);

  // Real-time subscription for attendance changes
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const record = payload.new as AttendanceRecord;
            setAttendanceMap((prev) => {
              const next = new Map(prev);
              next.set(record.student_id, record.status);
              return next;
            });
          } else if (payload.eventType === 'DELETE') {
            const record = payload.old as AttendanceRecord;
            setAttendanceMap((prev) => {
              const next = new Map(prev);
              next.delete(record.student_id);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const studentsWithAttendance: StudentWithAttendance[] = useMemo(() => {
    return students.map((s) => ({
      ...s,
      attendance: attendanceMap.get(s.id) || 'unmarked',
    }));
  }, [students, attendanceMap]);

  const toggleAttendance = useCallback(async (studentId: string) => {
    setTappingId(studentId);
    setTimeout(() => setTappingId(null), 150);

    const currentStatus = attendanceMap.get(studentId) || 'unmarked';
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const nextStatus = statusCycle[nextIndex] as AttendanceStatus;

    setAttendanceMap((prev) => {
      const next = new Map(prev);
      next.set(studentId, nextStatus);
      return next;
    });

    if (!sessionId || !user) return;

    if (!isOnline) {
      await saveOffline({
        session_id: sessionId,
        student_id: studentId,
        subject_id: DEFAULT_SUBJECT_ID,
        date: new Date().toISOString().split('T')[0] || '',
        status: nextStatus,
        marked_by: user.id,
      });
      return;
    }

    try {
      await markAttendanceMutation.mutateAsync({
        sessionId,
        studentId,
        subjectId: DEFAULT_SUBJECT_ID,
        date: new Date().toISOString().split('T')[0] || '',
        status: nextStatus,
        markedBy: user.id,
      });
    } catch {
      toast.error('Failed to save attendance');
    }
  }, [attendanceMap, sessionId, user, isOnline, saveOffline, markAttendanceMutation]);

  const markAll = useCallback(async (status: AttendanceStatus) => {
    const newMap = new Map(attendanceMap);
    students.forEach((s) => newMap.set(s.id, status));
    setAttendanceMap(newMap);

    if (!sessionId || !user) return;

    const records = students.map((s) => ({ student_id: s.id, status }));

    if (!isOnline) {
      for (const record of records) {
        await saveOffline({
          session_id: sessionId,
          student_id: record.student_id,
          subject_id: DEFAULT_SUBJECT_ID,
          date: new Date().toISOString().split('T')[0] || '',
          status: record.status,
          marked_by: user.id,
        });
      }
      return;
    }

    try {
      await bulkMarkAttendance.mutateAsync({
        sessionId,
        subjectId: DEFAULT_SUBJECT_ID,
        date: new Date().toISOString().split('T')[0] || '',
        records,
        markedBy: user.id,
      });
      toast.success(`Marked all as ${status}`);
    } catch {
      toast.error('Failed to mark all attendance');
    }
  }, [attendanceMap, students, sessionId, user, isOnline, saveOffline, bulkMarkAttendance]);

  const filteredStudents = useMemo(() => {
    let result = [...studentsWithAttendance];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.full_name.toLowerCase().includes(q) || s.roll_number.includes(q)
      );
    }

    if (filterMode !== 'all') {
      result = result.filter((s) => s.attendance === filterMode);
    }

    if (sortMode === 'name') {
      result.sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else {
      result.sort((a, b) => a.roll_number.localeCompare(b.roll_number));
    }

    return result;
  }, [studentsWithAttendance, search, sortMode, filterMode]);

  const summary = useMemo(() => {
    const present = studentsWithAttendance.filter((s) => s.attendance === 'present').length;
    const absent = studentsWithAttendance.filter((s) => s.attendance === 'absent').length;
    const leave = studentsWithAttendance.filter((s) => s.attendance === 'leave').length;
    const total = studentsWithAttendance.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, leave, total, percentage };
  }, [studentsWithAttendance]);

  const handleStartSession = async () => {
    try {
      const now = new Date();
      const result = await createSession.mutateAsync({
        subject_id: DEFAULT_SUBJECT_ID,
        teacher_id: null,
        date: now.toISOString().split('T')[0] || '',
        start_time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        end_time: `${String(now.getHours() + 1).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        class_id: DEFAULT_CLASS_ID,
        status: 'in_progress',
        marked_by: user?.id || '',
      });
      setSessionId(result.id);
      toast.success('Session started!');
    } catch {
      toast.error('Failed to start session');
    }
  };

  const handleFinish = async () => {
    if (!sessionId) return;

    try {
      await completeSession.mutateAsync(sessionId);
      setSessionId(null);
      setAttendanceMap(new Map());
      toast.success('Attendance saved successfully!');
    } catch {
      toast.error('Failed to complete session');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Mark Attendance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tap cards to cycle: Present → Absent → Leave → Reset
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
        <Button size="sm" variant="success" onClick={() => markAll('present')}>
          <CheckCircle size={14} /> All Present
        </Button>
        <Button size="sm" variant="danger" onClick={() => markAll('absent')}>
          <XCircle size={14} /> All Absent
        </Button>
        <Button size="sm" variant="ghost" onClick={() => markAll('unmarked')}>
          <RotateCcw size={14} /> Reset
        </Button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or roll number..."
        />
      </motion.div>

      {/* Sort & Filter Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setSortMode(sortMode === 'roll' ? 'name' : 'roll')}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <ArrowUpDown size={12} />
            Sort: {sortMode === 'roll' ? 'Roll' : 'Name'}
          </button>
          <button className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
            <Filter size={12} />
            Filter
          </button>
        </div>
        <Tabs
          tabs={[
            { id: 'all', label: `All (${studentsWithAttendance.length})` },
            { id: 'present', label: `Present (${summary.present})` },
            { id: 'absent', label: `Absent (${summary.absent})` },
            { id: 'leave', label: `Leave (${summary.leave})` },
          ]}
          activeTab={filterMode}
          onChange={(id) => setFilterMode(id as FilterMode)}
        />
      </motion.div>

      {/* Live Summary Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sticky top-0 z-10 mb-3">
        <Card padding="sm" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-sm">
              <span className="text-success-600 font-semibold">✓ {summary.present}</span>
              <span className="text-danger-600 font-semibold">✗ {summary.absent}</span>
              <span className="text-warning-600 font-semibold">◷ {summary.leave}</span>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {summary.total} total • {summary.percentage}%
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Student Cards */}
      <div className="space-y-2 mb-20">
        <AnimatePresence>
          {filteredStudents.map((student, i) => {
            const config = statusConfig[student.attendance];
            const Icon = config.icon;

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.02 }}
              >
                <button
                  onClick={() => toggleAttendance(student.id)}
                  className={clsx(
                    'w-full text-left rounded-2xl border-2 p-4 transition-all duration-150',
                    'active:scale-[0.98] active:shadow-soft',
                    config.bg,
                    config.border,
                    tappingId === student.id && 'scale-[0.96]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold',
                        student.attendance === 'present' && 'bg-success-100 text-success-700',
                        student.attendance === 'absent' && 'bg-danger-100 text-danger-700',
                        student.attendance === 'leave' && 'bg-warning-100 text-warning-700',
                        student.attendance === 'unmarked' && 'bg-gray-100 dark:bg-gray-800 text-gray-500',
                      )}>
                        {student.roll_number}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {student.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Roll #{student.roll_number}
                        </p>
                      </div>
                    </div>
                    <div className={clsx('p-2 rounded-xl', config.bg)}>
                      <Icon size={24} className={config.color} />
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-16 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 safe-bottom"
      >
        <div className="flex gap-3 max-w-lg mx-auto">
          {!sessionId ? (
            <Button
              variant="primary"
              icon={<Save size={18} />}
              className="flex-1"
              onClick={handleStartSession}
              loading={createSession.isPending}
            >
              Start Session
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                icon={<Share2 size={18} />}
                className="flex-1"
                onClick={() => toast.success('Share feature coming soon!')}
              >
                Share
              </Button>
              <Button
                variant="primary"
                icon={<Save size={18} />}
                className="flex-[2]"
                onClick={handleFinish}
                loading={completeSession.isPending}
              >
                Finish Attendance
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
