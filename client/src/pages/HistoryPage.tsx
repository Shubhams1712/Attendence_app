import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSessionHistory } from '@/hooks/useSessions';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import toast from 'react-hot-toast';
import type { AttendanceSession } from '@/types';

const DEFAULT_CLASS_ID = '00000000-0000-0000-0000-000000000001';

export function HistoryPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const startDate = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const endDate = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data: history = [], isLoading } = useSessionHistory(DEFAULT_CLASS_ID, 50, 0);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter sessions for the current week for calendar view
  const weekSessions = useMemo(() => {
    return history.filter((session) => {
      const sessionDate = session.date;
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }, [history, startDate, endDate]);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Attendance History</h1>
        <Tabs
          tabs={[
            { id: 'list', label: 'List', icon: <List size={14} /> },
            { id: 'calendar', label: 'Calendar', icon: <Calendar size={14} /> },
          ]}
          activeTab={viewMode}
          onChange={(id) => setViewMode(id as 'list' | 'calendar')}
        />
      </motion.div>

      {viewMode === 'calendar' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setSelectedDate(subDays(selectedDate, 7))} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <ChevronLeft size={20} className="text-gray-500" />
              </button>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </p>
              <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <ChevronRight size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
              ))}
              {weekDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const hasRecord = weekSessions.some((h) => h.date === dateStr);
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
                return (
                  <button
                    key={dateStr}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                      isToday ? 'bg-primary-600 text-white font-bold' :
                      hasRecord ? 'bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-400' :
                      'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {format(day, 'd')}
                    {hasRecord && !isToday && <div className="w-1 h-1 bg-success-500 rounded-full mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={<Calendar size={32} />}
            title="No Records Yet"
            description="Attendance history will appear here"
          />
        ) : (
          history.map((session: AttendanceSession, i: number) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card interactive onClick={() => toast.success('View details coming soon!')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {session.start_time} - {session.end_time}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(session.date), 'EEEE, MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-present text-[10px]">Completed</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
