import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as services from '@/lib/services';
import { formatDate, formatTime, calculateStats } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { Clock, CalendarDays, ChevronDown, Filter, ArrowUpDown } from 'lucide-react';
import type { Session, AttendanceRecord } from '@/types';

type FilterMode = 'all' | 'today' | 'week' | 'month' | 'custom';

export function HistoryPage() {
  const { classData } = useAuth();
  const [sessions, setSessions] = useState<(Session & { subjectName?: string; facultyName?: string; present?: number; total?: number; pct?: number })[]>([]);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortNewest, setSortNewest] = useState(true);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classData?.id) loadHistory();
  }, [classData?.id]);

  const loadHistory = async () => {
    if (!classData?.id) return;
    setLoading(true);
    try {
      const [sess, subs, facs, allRecords] = await Promise.all([
        services.getSessions(classData.id),
        services.getSubjects(classData.id),
        services.getFaculties(classData.id),
        services.getAllAttendanceRecords(classData.id),
      ]);

      const recordsBySession = new Map<string, AttendanceRecord[]>();
      for (const r of allRecords) {
        const existing = recordsBySession.get(r.session_id) || [];
        existing.push(r);
        recordsBySession.set(r.session_id, existing);
      }

      const enriched = sess.map(s => {
        const records = recordsBySession.get(s.id) || [];
        const stats = calculateStats(records.map(r => r.status));
        return {
          ...s,
          subjectName: subs.find(sub => sub.id === s.subject_id)?.name || 'Unknown',
          facultyName: facs.find(f => f.id === s.faculty_id)?.name || 'Unknown',
          present: stats.present + stats.late,
          total: stats.total,
          pct: stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0,
        };
      });

      setSessions(enriched);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    if (q && !s.subjectName?.toLowerCase().includes(q) && !s.facultyName?.toLowerCase().includes(q) &&
      !String(s.lecture_number).includes(q) && !(s.date || '').includes(q)) return false;
    if (filterMode === 'today' && s.date !== today) return false;
    if (filterMode === 'week' && s.date < weekAgo) return false;
    if (filterMode === 'month' && s.date < monthAgo) return false;
    if (filterMode === 'custom') {
      if (customStart && s.date < customStart) return false;
      if (customEnd && s.date > customEnd) return false;
    }
    return true;
  }).sort((a, b) => {
    const comparison = (a.date || '').localeCompare(b.date || '');
    return sortNewest ? -comparison : comparison;
  });

  if (loading) {
    return (
      <div className="p-4 space-y-2 animate-pulse">
        <div className="h-10 bg-surface rounded-xl" />
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-surface rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by subject, faculty, date..." className="flex-1" />
        <button onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-colors ${
            showFilters || filterMode !== 'all'
              ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/20 dark:border-primary-800'
              : 'bg-surface border-border text-text-secondary hover:bg-surface-tertiary'
          }`}>
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {showFilters && (
        <Card className="animate-slide-down space-y-3">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'today', 'week', 'month', 'custom'] as FilterMode[]).map(mode => (
              <button key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterMode === mode
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-tertiary text-text-secondary hover:bg-border'
                }`}>
                {mode === 'all' ? 'All' : mode === 'today' ? 'Today' : mode === 'week' ? 'This Week' : mode === 'month' ? 'This Month' : 'Custom'}
              </button>
            ))}
          </div>
          {filterMode === 'custom' && (
            <div className="flex gap-2">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs" />
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs" />
            </div>
          )}
          <button onClick={() => setSortNewest(!sortNewest)}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortNewest ? 'Newest first' : 'Oldest first'}
          </button>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={<Clock className="w-8 h-8" />} title="No attendance records" description="Take your first attendance to see it here" />
      ) : (
        <div className="space-y-2">
          {filtered.map(session => (
            <Link key={session.id} to={`/attendance/${session.id}`}>
              <Card hover className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{session.subjectName}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {formatDate(session.date)} at {session.time}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    (session.pct ?? 0) >= 75 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                    (session.pct ?? 0) >= 50 ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {session.pct}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <span>{session.facultyName}</span>
                  <span>Lec {session.lecture_number}</span>
                  <span className="ml-auto font-medium text-text-primary">
                    {session.present}/{session.total}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
