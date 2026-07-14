import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { usePIN } from '@/contexts/PINContext';
import * as services from '@/lib/services';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PINDialog } from '@/components/layout/PINDialog';
import { formatDate, formatTime, calculateStats, statusColor, statusLabel, cn } from '@/lib/utils';
import { generateAttendanceReport, shareContent, copyToClipboard, downloadFile } from '@/lib/share';
import { ArrowLeft, Share2, Copy, Download, Edit3, Trash2, CopyPlus as Duplicate, Check } from 'lucide-react';
import type { Session, Subject, Faculty, Student, AttendanceRecord, AttendanceStatus } from '@/types';

export function AttendanceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteSession, showToast } = useApp();
  const { isVerified } = usePIN();
  const [showPIN, setShowPIN] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  const [session, setSession] = useState<Session | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [records, setRecords] = useState<(AttendanceRecord & { student?: Student })[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, medical: 0, holiday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (sessionId: string) => {
    setLoading(true);
    try {
      const sess = await services.getSession(sessionId);
      if (!sess) { navigate('/history'); return; }
      setSession(sess);

      const [subj, fac, allRecords, allStudents] = await Promise.all([
        services.getSubjectById(sess.subject_id),
        services.getFacultyById(sess.faculty_id),
        services.getAttendanceRecords(sessionId),
        services.getStudents(sess.class_id),
      ]);
      setSubject(subj || null);
      setFaculty(fac || null);

      const enriched = allRecords.map(r => ({
        ...r,
        student: allStudents.find(s => s.id === r.student_id),
      }));
      setRecords(enriched);
      setStats(calculateStats(allRecords.map(r => r.status)));
    } catch (e) {
      console.error('Failed to load attendance details:', e);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.id) return;
    if (confirm('Delete this attendance record? This cannot be undone.')) {
      try {
        await deleteSession(session.id);
        showToast('Attendance deleted', 'success');
        navigate('/history');
      } catch (e: any) {
        console.error('Delete error:', e);
        showToast(e.message || 'Failed to delete', 'error');
      }
    }
  };

  const handleShare = async () => {
    if (!session) return;
    const report = generateAttendanceReport(session, subject || undefined, faculty || undefined,
      records.map(r => r.student!).filter(Boolean), records);
    const shared = await shareContent('Attendance Report', report);
    if (!shared) await copyToClipboard(report);
    showToast('Attendance report copied', 'success');
  };

  const handleCopy = async () => {
    if (!session) return;
    const report = generateAttendanceReport(session, subject || undefined, faculty || undefined,
      records.map(r => r.student!).filter(Boolean), records);
    await copyToClipboard(report);
    showToast('Copied to clipboard', 'success');
  };

  const handleExportTxt = () => {
    if (!session) return;
    const report = generateAttendanceReport(session, subject || undefined, faculty || undefined,
      records.map(r => r.student!).filter(Boolean), records);
    downloadFile(report, `attendance-${session.lecture_number}-${session.date}.txt`, 'text/plain');
    showToast('Downloaded as TXT', 'success');
  };

  const requireAuth = (action: () => void) => {
    if (isVerified) { action(); }
    else { setPendingAction(() => action); setShowPIN(true); }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse max-w-lg mx-auto">
        <div className="h-8 w-16 bg-surface rounded-lg" />
        <div className="h-32 bg-surface rounded-xl" />
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-surface rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="p-4 space-y-4 animate-fade-in max-w-lg mx-auto pb-24">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors inline-flex items-center gap-1">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      {/* Header Card */}
      <Card className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{subject?.name || 'Unknown Subject'}</h2>
            <p className="text-sm text-text-tertiary mt-1">{formatDate(session.date)} at {session.time}</p>
          </div>
          <span className="text-2xl font-bold text-primary-600">L{session.lecture_number}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-text-tertiary">Faculty</span>
            <p className="font-medium text-text-primary">{faculty?.name || 'Unknown'}</p>
          </div>
          {session.classroom && <div>
            <span className="text-text-tertiary">Classroom</span>
            <p className="font-medium text-text-primary">{session.classroom}</p>
          </div>}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: 'Present', value: stats.present, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { label: 'Absent', value: stats.absent, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
          { label: 'Late', value: stats.late, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Medical', value: stats.medical, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Holiday', value: stats.holiday, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
        ].map(s => (
          <Card key={s.label} className="p-2 text-center">
            <p className={`text-lg font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-[10px] text-text-tertiary">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" icon={<Share2 className="w-4 h-4" />} onClick={handleShare}>Share</Button>
        <Button size="sm" variant="secondary" icon={<Copy className="w-4 h-4" />} onClick={handleCopy}>Copy</Button>
        <Button size="sm" variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExportTxt}>TXT</Button>
        <Button size="sm" variant="secondary" icon={<Edit3 className="w-4 h-4" />} onClick={() => requireAuth(() => showToast('Edit mode coming soon', 'info'))}>Edit</Button>
        <Button size="sm" variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={() => requireAuth(handleDelete)}>Delete</Button>
      </div>

      {/* Student List */}
      <div className="space-y-1">
        {records.map(record => (
          <div key={record.id} className="flex items-center justify-between px-4 py-2.5 bg-surface rounded-xl">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-surface-tertiary flex items-center justify-center text-xs font-bold text-text-secondary">
                {record.student?.roll_number}
              </span>
              <span className="text-sm text-text-primary">{record.student?.name}</span>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusColor(record.status)}`}>
              {statusLabel(record.status)}
            </span>
          </div>
        ))}
      </div>

      <PINDialog open={showPIN} onClose={() => setShowPIN(false)} />
    </div>
  );
}
