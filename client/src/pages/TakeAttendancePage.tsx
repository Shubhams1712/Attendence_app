import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import * as services from '@/lib/services';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { formatDate, statusColor, statusLabel } from '@/lib/utils';
import { ArrowLeft, Check, X, Clock, Stethoscope, Sun, RotateCcw, CheckCheck } from 'lucide-react';
import type { Student, AttendanceStatus } from '@/types';

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: 'border-l-4 border-l-green-500',
  absent: 'border-l-4 border-l-red-500',
  late: 'border-l-4 border-l-yellow-500',
  medical: 'border-l-4 border-l-blue-500',
  holiday: 'border-l-4 border-l-purple-500',
};

const STATUS_ICONS: Record<AttendanceStatus, React.ReactNode> = {
  present: <Check className="w-5 h-5" />,
  absent: <X className="w-5 h-5" />,
  late: <Clock className="w-5 h-5" />,
  medical: <Stethoscope className="w-5 h-5" />,
  holiday: <Sun className="w-5 h-5" />,
};

export function TakeAttendancePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { createSession, saveAttendanceRecord, showToast } = useApp();
  const { classData } = useAuth();
  const state = location.state as any;

  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state) { navigate('/attendance/new'); return; }
    loadStudents();
  }, []);

  const loadStudents = async () => {
    if (!classData?.id) return;
    try {
      const all = await services.getStudents(classData.id);
      setStudents(all);
      const initial: Record<string, AttendanceStatus> = {};
      all.forEach(s => { initial[s.id] = 'present'; });
      setStatuses(initial);
    } catch (e) {
      console.error('Failed to load students:', e);
      showToast('Failed to load students', 'error');
    }
  };

  const debouncedSave = useCallback((studentId: string, status: AttendanceStatus) => {
    setAutoSaveIndicator(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => setAutoSaveIndicator(false), 1500);
  }, []);

  const cycleStatus = (studentId: string) => {
    setStatuses(prev => {
      const current = prev[studentId] || 'present';
      const order: AttendanceStatus[] = ['present', 'absent', 'late', 'medical', 'holiday'];
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      const next = order[nextIdx];
      debouncedSave(studentId, next);
      return { ...prev, [studentId]: next };
    });
  };

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(s => { updated[s.id] = status; });
    setStatuses(updated);
    showToast(`All marked as ${statusLabel(status)}`, 'info');
  };

  const invertSelection = () => {
    setStatuses(prev => {
      const updated = { ...prev };
      students.forEach(s => {
        const current = updated[s.id] || 'present';
        updated[s.id] = current === 'present' ? 'absent' : 'present';
      });
      return updated;
    });
  };

  const handleFinish = async () => {
    if (!state) return;
    setSaving(true);
    try {
      const sessionId = await createSession(
        state.date, new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        state.subjectId, state.facultyId, state.lectureNumber, state.classroom
      );
      const promises = Object.entries(statuses).map(([studentId, status]) =>
        saveAttendanceRecord(sessionId, studentId, status)
      );
      await Promise.all(promises);
      showToast('Attendance saved!', 'success');
      navigate(`/attendance/${sessionId}`);
    } catch (e: any) {
      console.error('=== FAILED TO SAVE ATTENDANCE ===');
      console.error('Error:', e);
      console.error('Error message:', e?.message);
      console.error('Error code:', e?.code);
      console.error('Error details:', e?.details);
      console.error('Error hint:', e?.hint);
      if (e?.status) console.error('HTTP status:', e.status);
      if (e?.statusText) console.error('HTTP status text:', e.statusText);
      try { console.error('Full serialized error:', JSON.stringify(e, Object.getOwnPropertyNames(e))); } catch (_) {}
      showToast(`Error saving attendance: ${e?.message || 'Unknown error'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    String(s.roll_number).includes(search)
  );

  const counts = Object.values(statuses).reduce((acc: Record<string, number>, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!state) return null;

  return (
    <div className="min-h-screen bg-surface-secondary animate-fade-in">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-surface border-b border-border">
        <div className="px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg text-text-secondary hover:bg-surface-tertiary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {autoSaveIndicator && <span className="text-xs text-green-600 animate-pulse">Auto-saving...</span>}
              <span className="text-xs text-text-tertiary bg-surface-tertiary px-2 py-1 rounded-full">
                L{state.lectureNumber}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary">{formatDate(state.date)}</p>
            </div>
            <div className="flex gap-3 text-xs font-medium">
              <span className="text-green-600">P: {counts.present || 0}</span>
              <span className="text-red-600">A: {counts.absent || 0}</span>
              <span className="text-yellow-600">L: {counts.late || 0}</span>
              <span className="text-blue-600">M: {counts.medical || 0}</span>
              <span className="text-purple-600">H: {counts.holiday || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto max-w-lg mx-auto">
        <button onClick={() => markAll('present')} className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 transition-colors flex items-center gap-1">
          <CheckCheck className="w-3.5 h-3.5" /> All Present
        </button>
        <button onClick={() => markAll('absent')} className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 transition-colors flex items-center gap-1">
          <X className="w-3.5 h-3.5" /> All Absent
        </button>
        <button onClick={invertSelection} className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-tertiary text-text-secondary hover:bg-border transition-colors">
          Invert
        </button>
        <button onClick={() => markAll('present')} className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-tertiary text-text-secondary hover:bg-border transition-colors flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 max-w-lg mx-auto">
        <SearchInput value={search} onChange={setSearch} placeholder="Search students..." />
      </div>

      {/* Student List */}
      <div className="px-4 pb-32 max-w-lg mx-auto space-y-1">
        {filteredStudents.map(student => {
          const status = statuses[student.id] || 'present';
          return (
            <div
              key={student.id}
              onClick={() => cycleStatus(student.id)}
              className={`flex items-center justify-between px-4 py-3 bg-surface rounded-xl cursor-pointer active:scale-[0.99] transition-all hover:shadow-sm ${STATUS_COLORS[status]}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-tertiary flex items-center justify-center text-xs font-bold text-text-secondary">
                  {student.roll_number}
                </div>
                <span className="text-sm font-medium text-text-primary">{student.name}</span>
              </div>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${statusColor(status)}`}>
                {STATUS_ICONS[status]}
                {statusLabel(status)}
              </span>
            </div>
          );
        })}
        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-text-tertiary">No students match your search</p>
          </div>
        )}
      </div>

      {/* Finish Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-surface-secondary via-surface-secondary to-transparent max-w-lg mx-auto">
        <Button
          size="lg"
          className="w-full shadow-lg"
          onClick={handleFinish}
          loading={saving}
        >
          Finish & Save Attendance
        </Button>
      </div>
    </div>
  );
}
