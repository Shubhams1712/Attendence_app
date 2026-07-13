import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Calendar, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface AttendanceSummaryRow {
  date: string;
  subject: string;
  present: number;
  absent: number;
  leave: number;
  total: number;
}

export function TeacherPortalPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('attendance');
  const [attendance, setAttendance] = useState<AttendanceSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch attendance summaries
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: sessions } = await supabase
          .from('attendance_sessions')
          .select('*')
          .eq('status', 'completed')
          .order('date', { ascending: false })
          .limit(30);

        if (sessions) {
          // Fetch all records for these sessions in one query (fixes N+1)
          const sessionIds = sessions.map((s) => s.id);
          const { data: allRecords } = await supabase
            .from('attendance_records')
            .select('session_id, status')
            .in('session_id', sessionIds);

          // Group records by session_id
          const recordsBySession = new Map<string, { status: string }[]>();
          if (allRecords) {
            for (const record of allRecords) {
              const existing = recordsBySession.get(record.session_id) || [];
              existing.push(record);
              recordsBySession.set(record.session_id, existing);
            }
          }

          const summaries: AttendanceSummaryRow[] = sessions.map((session) => {
            const records = recordsBySession.get(session.id) || [];
            return {
              date: session.date,
              subject: 'Unknown',
              present: records.filter((r) => r.status === 'present').length,
              absent: records.filter((r) => r.status === 'absent').length,
              leave: records.filter((r) => r.status === 'leave').length,
              total: records.length,
            };
          });
          setAttendance(summaries);
        }
      } catch {
        // Use empty data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredAttendance.length === 0 ? (
            <EmptyState
              icon={<Calendar size={32} />}
              title="No Records"
              description="No attendance records found"
            />
          ) : (
            filteredAttendance.map((record, i) => {
              const percentage = record.total > 0 ? Math.round((record.present / record.total) * 100) : 0;
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
