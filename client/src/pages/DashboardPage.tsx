import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  BookOpen,
  TrendingUp,
  Calendar,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatSkeleton } from '@/components/ui/Skeleton';
import { supabase } from '@/lib/supabase';
import { useStudents } from '@/hooks/useStudents';
import { useTodaySessions } from '@/hooks/useSessions';

interface DashboardStats {
  totalStudents: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
  todaySubject: string;
  teacherName: string;
  lectureTime: string;
}

// Default class_id - in production this would come from user settings
const DEFAULT_CLASS_ID = '1';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const { data: students = [] } = useStudents(DEFAULT_CLASS_ID);
  const { data: todaySessions = [] } = useTodaySessions(DEFAULT_CLASS_ID);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      // Get today's session info
      const currentSession = todaySessions?.[0] as Record<string, unknown> | undefined;
      const subjectName = (currentSession?.subjects as Record<string, unknown> | undefined)?.name as string || 'No Session';

      // Get attendance for current session
      let present = 0;
      let absent = 0;
      let leave = 0;

      if (currentSession) {
        const { data: records } = await supabase
          .from('attendance_records')
          .select('status')
          .eq('session_id', currentSession.id);

        if (records) {
          present = records.filter((r) => r.status === 'present').length;
          absent = records.filter((r) => r.status === 'absent').length;
          leave = records.filter((r) => r.status === 'leave').length;
        }
      }

      const totalStudents = students.length;
      const percentage = totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0;

      setStats({
        totalStudents,
        present,
        absent,
        leave,
        percentage,
        todaySubject: subjectName,
        teacherName: user?.full_name || 'Teacher',
        lectureTime: currentSession
          ? `${currentSession.start_time} - ${currentSession.end_time}`
          : 'No lecture scheduled',
      });
    };

    if (students.length > 0) {
      loadDashboard();
    }
  }, [students, todaySessions, user]);

  const statCards = stats
    ? [
        { label: 'Present', value: stats.present, icon: UserCheck, color: 'text-success-600', bg: 'bg-success-50 dark:bg-success-500/10' },
        { label: 'Absent', value: stats.absent, icon: UserX, color: 'text-danger-600', bg: 'bg-danger-50 dark:bg-danger-500/10' },
        { label: 'Leave', value: stats.leave, icon: Clock, color: 'text-warning-600', bg: 'bg-warning-50 dark:bg-warning-500/10' },
        { label: 'Total', value: stats.totalStudents, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-500/10' },
      ]
    : [];

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hello, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400 tabular-nums">
              {format(currentTime, 'hh:mm:ss')}
            </p>
            <p className="text-xs text-gray-400">{format(currentTime, 'a')}</p>
          </div>
        </div>
      </motion.div>

      {/* Today's Subject Card */}
      {!stats ? (
        <StatSkeleton />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary-600 to-primary-800 border-0 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Today's Subject</p>
                  <p className="text-lg font-bold text-white">{stats.todaySubject}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {stats.teacherName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {stats.lectureTime}
                </span>
              </div>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <Card className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                      <Icon size={22} className={stat.color} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Attendance Percentage */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary-50 dark:bg-primary-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp size={22} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats.percentage}%
                  </p>
                </div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-800" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3"
                    strokeDasharray={`${stats.percentage} ${100 - stats.percentage}`}
                    className="text-primary-600"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-600">
                  {stats.percentage}%
                </span>
              </div>
            </Card>
          </motion.div>

          {/* Start Attendance Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              fullWidth
              icon={<Zap size={22} />}
              onClick={() => navigate('/attendance')}
              className="text-lg h-14"
            >
              Start Attendance
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
}
