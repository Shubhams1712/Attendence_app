import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Calendar, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DEMO_ATTENDANCE = [
  { date: format(new Date(), 'yyyy-MM-dd'), subject: 'Data Structures', present: 58, absent: 3, leave: 1, total: 62 },
  { date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'), subject: 'Operating Systems', present: 55, absent: 5, leave: 2, total: 62 },
  { date: format(new Date(Date.now() - 172800000), 'yyyy-MM-dd'), subject: 'Database Management', present: 60, absent: 1, leave: 1, total: 62 },
];

export function TeacherPortalPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('attendance');
  const [attendance] = useState(DEMO_ATTENDANCE);

  const filteredAttendance = useMemo(() => {
    if (!search) return attendance;
    const q = search.toLowerCase();
    return attendance.filter(
      (a) =>
        a.subject.toLowerCase().includes(q) ||
        a.date.includes(q)
    );
  }, [attendance, search]);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Eye size={20} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Portal</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">View attendance records (read-only)</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
        <Tabs
          tabs={[
            { id: 'attendance', label: 'Attendance', icon: <Calendar size={14} /> },
            { id: 'students', label: 'Students', icon: <BookOpen size={14} /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by subject or date..." />
      </motion.div>

      {activeTab === 'attendance' ? (
        <div className="space-y-2">
          {filteredAttendance.length === 0 ? (
            <EmptyState
              icon={<Calendar size={32} />}
              title="No Records"
              description="No attendance records found"
            />
          ) : (
            filteredAttendance.map((record, i) => {
              const percentage = Math.round((record.present / record.total) * 100);
              return (
                <motion.div
                  key={`${record.date}-${record.subject}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{record.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(record.date), 'EEEE, MMM d')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600">{percentage}%</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-success-600">✓ {record.present}</span>
                      <span className="text-danger-600">✗ {record.absent}</span>
                      <span className="text-warning-600">◷ {record.leave}</span>
                      <span className="text-gray-400 ml-auto">/ {record.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-2">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="Student List"
          description="Student list view coming soon"
        />
      )}

      {/* Export Button */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4">
        <Button
          variant="secondary"
          fullWidth
          icon={<Download size={18} />}
          onClick={() => toast.success('Export coming soon!')}
        >
          Export Report
        </Button>
      </motion.div>
    </div>
  );
}
