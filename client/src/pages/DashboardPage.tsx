import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import * as services from '@/lib/services';
import { formatDate, calculateStats, getCurrentAcademicYear, getCurrentSemester } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users, ClipboardCheck, Clock, BarChart3, GraduationCap,
  BookOpen, TrendingUp, Calendar, ArrowRight, UserPlus
} from 'lucide-react';
import type { Session } from '@/types';

export function DashboardPage() {
  const { classData } = useAuth();
  const [studentsCount, setStudentsCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [recentSessions, setRecentSessions] = useState<(Session & { present?: number; total?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classData?.id) loadDashboard();
  }, [classData?.id]);

  const loadDashboard = async () => {
    if (!classData?.id) return;
    setLoading(true);
    try {
      const [count, scount, todaySess, allRecords, recent] = await Promise.all([
        services.getStudentCount(classData.id),
        services.getSessionCount(classData.id),
        services.getTodaySessions(classData.id),
        services.getAllAttendanceRecords(classData.id),
        services.getSessions(classData.id).then(s => s.slice(0, 5)),
      ]);

      setStudentsCount(count);
      setSessionsCount(scount);
      setTodaySessions(todaySess);

      if (allRecords.length > 0) {
        const stats = calculateStats(allRecords.map(r => r.status));
        const pct = Math.round(((stats.present + stats.late) / stats.total) * 100);
        setOverallPercentage(pct);
      }

      const recentWithStats = recent.map(s => {
        const sessionRecords = allRecords.filter(r => r.session_id === s.id);
        const present = sessionRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        return { ...s, present, total: sessionRecords.length };
      });
      setRecentSessions(recentWithStats);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'New Attendance', icon: ClipboardCheck, to: '/attendance/new', color: 'bg-primary-500' },
    { label: 'Students', icon: Users, to: '/students', color: 'bg-green-500' },
    { label: 'History', icon: Clock, to: '/history', color: 'bg-amber-500' },
    { label: 'Reports', icon: BarChart3, to: '/reports', color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-32 bg-surface rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-surface rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white">
        <p className="text-primary-100 text-sm">{formatDate(new Date())}</p>
        <h2 className="text-xl font-bold mt-1">Attendance Dashboard</h2>
        <div className="flex gap-4 mt-3 text-sm text-primary-100">
          <span>AY {getCurrentAcademicYear()}</span>
          <span>Sem {getCurrentSemester()}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{studentsCount}</p>
              <p className="text-xs text-text-tertiary">Total Students</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{sessionsCount}</p>
              <p className="text-xs text-text-tertiary">Lectures</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{todaySessions.length}</p>
              <p className="text-xs text-text-tertiary">Today</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{overallPercentage}%</p>
              <p className="text-xs text-text-tertiary">Attendance</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map(action => (
            <Link key={action.to} to={action.to}>
              <button className="w-full flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface border border-border hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm transition-all active:scale-95">
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-text-secondary text-center leading-tight">
                  {action.label}
                </span>
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Attendance */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Recent Lectures</h3>
          <Link to="/history" className="text-xs text-primary-600 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentSessions.map(session => (
            <Link key={session.id} to={`/attendance/${session.id}`}>
              <Card hover className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Lecture {session.lecture_number}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {formatDate(session.date)} • {session.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {session.present ?? 0}/{session.total ?? 0}
                  </p>
                  <p className="text-xs text-text-tertiary">Present</p>
                </div>
              </Card>
            </Link>
          ))}
          {recentSessions.length === 0 && (
            <Card className="p-6 text-center">
              <GraduationCap className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No lectures yet</p>
              <Link to="/attendance/new">
                <Button size="sm" className="mt-3">Take Attendance</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
