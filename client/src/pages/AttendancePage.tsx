import { useState, useCallback, useMemo } from 'react';
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
import type { AttendanceStatus, Student } from '@shared/types';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// Demo students - replace with real data
const DEMO_STUDENTS: (Student & { attendance: AttendanceStatus })[] = [
  { id: '1', roll_number: '001', full_name: 'Aarav Patel', gender: 'male', status: 'active', class_id: '1', created_at: '', updated_at: '', attendance: 'unmarked' },
  { id: '2', roll_number: '002', full_name: 'Priya Sharma', gender: 'female', status: 'active', class_id: '1', created_at: '', updated_at: '', attendance: 'unmarked' },
  { id: '3', roll_number: '003', full_name: 'Rohan Gupta', gender: 'male', status: 'active', class_id: '1', created_at: '', updated_at: '', attendance: 'unmarked' },
  { id: '4', roll_number: '004', full_name: 'Ananya Singh', gender: 'female', status: 'active', class_id: '1', created_at: '', updated_at: '', attendance: 'unmarked' },
  { id: '5', roll_number: '005', full_name: 'Vikram Desai', gender: 'male', status: 'active', class_id: '1', created_at: '', updated_at: '', attendance: 'unmarked' },
  { id: '6', roll_number: '006', full_name: 'Meera Joshi', gender: 'female', status: 'active', class_id: '1', created_at: '', updated_at: '', attendance: 'unmarked' },
  { id: '7', roll_number: '007', full_name: 'Arjun Reddy', gender: 'male', status: 'active', class_id: '1', created_at: '', updated_at: '', attendance: 'unmarked' },
  { id: '8', roll_number: '008', full_name: 'Kavya Nair', gender: 'female', status: 'active', class_id: '1', created_at: '', updated_at: '', attendance: 'unmarked' },
  { id: '9', roll_number: '009', full_name: 'Aditya Kumar', gender: 'male', status: 'active', class_id: '1', created_at: '', updated_at: '', attendance: 'unmarked' },
  { id: '10', roll_number: '010', full_name: 'Diya Mehta', gender: 'female', status: 'active', class_id: '1', created_at: '', updated_at: '', attendance: 'unmarked' },
];

type SortMode = 'roll' | 'name';
type FilterMode = 'all' | 'present' | 'absent' | 'leave' | 'unmarked';

const statusCycle: AttendanceStatus[] = ['present', 'absent', 'leave', 'unmarked'];
const statusConfig: Record<AttendanceStatus, { color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  present: { color: 'text-success-600', bg: 'bg-success-50 dark:bg-success-500/10', border: 'border-success-400', icon: CheckCircle },
  absent: { color: 'text-danger-600', bg: 'bg-danger-50 dark:bg-danger-500/10', border: 'border-danger-400', icon: XCircle },
  leave: { color: 'text-warning-600', bg: 'bg-warning-50 dark:bg-warning-500/10', border: 'border-warning-400', icon: Clock },
  unmarked: { color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', icon: Users },
};

export function AttendancePage() {
  const [students, setStudents] = useState(DEMO_STUDENTS);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('roll');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [tappingId, setTappingId] = useState<string | null>(null);

  const toggleAttendance = useCallback((studentId: string) => {
    setTappingId(studentId);
    setTimeout(() => setTappingId(null), 150);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const currentIndex = statusCycle.indexOf(s.attendance);
        const nextIndex = (currentIndex + 1) % statusCycle.length;
        const nextStatus = statusCycle[nextIndex] as AttendanceStatus;
        return { ...s, attendance: nextStatus };
      })
    );
  }, []);

  const markAll = useCallback((status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendance: status })));
    toast.success(`Marked all as ${status}`);
  }, []);

  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.full_name.toLowerCase().includes(q) || s.roll_number.includes(q)
      );
    }

    // Filter
    if (filterMode !== 'all') {
      result = result.filter((s) => s.attendance === filterMode);
    }

    // Sort
    if (sortMode === 'name') {
      result.sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else {
      result.sort((a, b) => a.roll_number.localeCompare(b.roll_number));
    }

    return result;
  }, [students, search, sortMode, filterMode]);

  const summary = useMemo(() => {
    const present = students.filter((s) => s.attendance === 'present').length;
    const absent = students.filter((s) => s.attendance === 'absent').length;
    const leave = students.filter((s) => s.attendance === 'leave').length;
    const total = students.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, leave, total, percentage };
  }, [students]);

  const handleFinish = () => {
    toast.success('Attendance saved successfully!');
    // Navigate to summary or history
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
            { id: 'all', label: `All (${students.length})` },
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
          >
            Finish Attendance
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
