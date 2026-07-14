import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { usePIN } from '@/contexts/PINContext';
import { useTheme } from '@/contexts/ThemeContext';
import * as services from '@/lib/services';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PINDialog } from '@/components/layout/PINDialog';
import { getDefaultSettings, getCurrentAcademicYear, getCurrentSemester } from '@/lib/utils';
import { Lock, Sun, Moon, Monitor, Shield, Database, Download, Upload, Trash2, BookOpen, UserCheck, Plus, X, Save } from 'lucide-react';
import type { Subject, Faculty, BackupData } from '@/types';

export function SettingsPage() {
  const navigate = useNavigate();
  const { classData } = useAuth();
  const { showToast, addSubject, deleteSubject, addFaculty, deleteFaculty } = useApp();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { changePIN, isVerified, verifyPIN } = usePIN();
  const [showPIN, setShowPIN] = useState(true);
  const [showChangePIN, setShowChangePIN] = useState(false);
  const [showManageSubjects, setShowManageSubjects] = useState(false);
  const [showManageFaculty, setShowManageFaculty] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [className, setClassName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [threshold, setThreshold] = useState('75');
  const [saving, setSaving] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newFaculty, setNewFaculty] = useState('');

  const [oldPIN, setOldPIN] = useState('');
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [pinError, setPinError] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isVerified) {
      setIsAuthenticated(true);
      loadSettings();
    }
  }, [isVerified]);

  const loadSettings = async () => {
    if (!classData?.id) return;
    try {
      const defaults = getDefaultSettings();
      const [cn, ay, sem, thr, subs, facs] = await Promise.all([
        services.getSetting(classData.id, 'className'),
        services.getSetting(classData.id, 'academicYear'),
        services.getSetting(classData.id, 'semester'),
        services.getSetting(classData.id, 'attendanceThreshold'),
        services.getSubjects(classData.id),
        services.getFaculties(classData.id),
      ]);
      setClassName(cn || defaults.className);
      setAcademicYear(ay || defaults.academicYear);
      setSemester(sem || defaults.semester);
      setThreshold(thr || defaults.attendanceThreshold);
      setSubjects(subs);
      setFaculty(facs);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  const handleSave = async () => {
    if (!classData?.id) return;
    setSaving(true);
    try {
      await Promise.all([
        services.setSetting(classData.id, 'className', className),
        services.setSetting(classData.id, 'academicYear', academicYear),
        services.setSetting(classData.id, 'semester', semester),
        services.setSetting(classData.id, 'attendanceThreshold', threshold),
      ]);
      showToast('Settings saved!', 'success');
    } catch (e) {
      console.error('Failed to save settings:', e);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePIN = async () => {
    setPinError('');
    if (newPIN !== confirmPIN) { setPinError('PINs do not match'); return; }
    if (newPIN.length < 4) { setPinError('PIN must be at least 4 digits'); return; }
    const success = await changePIN(oldPIN, newPIN);
    if (success) {
      setShowChangePIN(false);
      setOldPIN(''); setNewPIN(''); setConfirmPIN('');
      showToast('PIN changed successfully!', 'success');
    } else {
      setPinError('Current PIN is incorrect');
    }
  };

  const handleBackup = async () => {
    if (!classData?.id) return;
    try {
      const backup = await services.exportBackup(classData.id);
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup exported', 'success');
    } catch (e) {
      console.error('Backup error:', e);
      showToast('Failed to export backup', 'error');
    }
  };

  const handleRestore = () => {
    if (!classData?.id) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const backup: BackupData = JSON.parse(text);
        if (!backup.students || !backup.settings) {
          showToast('Invalid backup file', 'error');
          return;
        }
        // Get the current user ID
        const user = await services.getCurrentUser();
        if (!user) { showToast('Not authenticated', 'error'); return; }
        await services.importBackup(classData.id, user.id, backup);
        showToast('Backup restored successfully!', 'success');
        loadSettings();
      } catch (e) {
        console.error('Restore error:', e);
        showToast('Failed to restore backup', 'error');
      }
    };
    input.click();
  };

  const handleReset = async () => {
    if (!classData?.id) return;
    if (confirm('This will permanently delete ALL data! Are you sure?')) {
      try {
        await services.resetDatabase(classData.id);
        showToast('Database reset complete', 'success');
        loadSettings();
      } catch (e) {
        console.error('Reset error:', e);
        showToast('Failed to reset database', 'error');
      }
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject(id);
      if (classData?.id) {
        setSubjects(await services.getSubjects(classData.id));
      }
    } catch (e) {
      console.error('Failed to delete subject:', e);
      showToast('Failed to delete subject', 'error');
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    try {
      await deleteFaculty(id);
      if (classData?.id) {
        setFaculty(await services.getFaculties(classData.id));
      }
    } catch (e) {
      console.error('Failed to delete faculty:', e);
      showToast('Failed to delete faculty', 'error');
    }
  };

  if (!isAuthenticated) {
    return <PINDialog open={true} onClose={() => navigate('/')} title="Settings — Enter PIN" />;
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-24">
      <h2 className="text-lg font-semibold text-text-primary">Settings</h2>

      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Display</h3>
        <div className="flex gap-2">
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Monitor, label: 'System' },
          ].map(opt => (
            <button key={opt.value}
              onClick={() => setTheme(opt.value as any)}
              className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                theme === opt.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-border bg-surface text-text-secondary hover:bg-surface-tertiary'
              }`}>
              <opt.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Class Info</h3>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Class Name</label>
          <input value={className} onChange={e => setClassName(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1">Academic Year</label>
            <input value={academicYear} onChange={e => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Semester</label>
            <input value={semester} onChange={e => setSemester(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Attendance</h3>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Minimum Attendance Threshold (%)</label>
          <input type="number" min={0} max={100} value={threshold} onChange={e => setThreshold(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={<BookOpen className="w-4 h-4" />}
            onClick={() => { loadSettings(); setShowManageSubjects(true); }}>
            Manage Subjects
          </Button>
          <Button size="sm" variant="secondary" icon={<UserCheck className="w-4 h-4" />}
            onClick={() => { loadSettings(); setShowManageFaculty(true); }}>
            Manage Faculty
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <Button variant="outline" className="w-full" icon={<Lock className="w-4 h-4" />}
          onClick={() => setShowChangePIN(true)}>
          Change PIN
        </Button>
      </Card>

      <Button className="w-full" icon={<Save className="w-4 h-4" />} loading={saving} onClick={handleSave}>
        Save Settings
      </Button>

      <Card className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Backup</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleBackup} className="flex-1">
            Export Backup
          </Button>
          <Button size="sm" variant="secondary" icon={<Upload className="w-4 h-4" />} onClick={handleRestore} className="flex-1">
            Restore
          </Button>
        </div>
      </Card>

      <Card className="p-4 border-red-200 dark:border-red-800">
        <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">Danger Zone</h3>
        <Button variant="danger" className="w-full" icon={<Trash2 className="w-4 h-4" />} onClick={handleReset}>
          Reset All Data
        </Button>
      </Card>

      <Modal open={showChangePIN} onClose={() => setShowChangePIN(false)} title="Change PIN">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Current PIN</label>
            <input type="password" inputMode="numeric" pattern="[0-9]*" value={oldPIN} onChange={e => setOldPIN(e.target.value.replace(/\D/g, ''))} maxLength={6}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">New PIN</label>
            <input type="password" inputMode="numeric" pattern="[0-9]*" value={newPIN} onChange={e => setNewPIN(e.target.value.replace(/\D/g, ''))} maxLength={6}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Confirm New PIN</label>
            <input type="password" inputMode="numeric" pattern="[0-9]*" value={confirmPIN} onChange={e => setConfirmPIN(e.target.value.replace(/\D/g, ''))} maxLength={6}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          {pinError && <p className="text-sm text-danger">{pinError}</p>}
          <Button className="w-full" onClick={handleChangePIN} disabled={!oldPIN || !newPIN || !confirmPIN}>Change PIN</Button>
        </div>
      </Modal>

      <Modal open={showManageSubjects} onClose={() => setShowManageSubjects(false)} title="Manage Subjects">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={newSubject} onChange={e => setNewSubject(e.target.value)}
              placeholder="Subject name"
              className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={async () => {
              if (newSubject.trim()) {
                try {
                  await addSubject(newSubject.trim());
                  setNewSubject('');
                  if (classData?.id) setSubjects(await services.getSubjects(classData.id));
                } catch (e) {
                  console.error('Failed to add subject:', e);
                  showToast('Failed to add subject', 'error');
                }
              }
            }}>Add</Button>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {subjects.map(s => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-tertiary">
                <span className="text-sm text-text-primary">{s.name}</span>
                <button onClick={() => handleDeleteSubject(s.id)} className="p-1 rounded text-text-tertiary hover:text-danger"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal open={showManageFaculty} onClose={() => setShowManageFaculty(false)} title="Manage Faculty">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={newFaculty} onChange={e => setNewFaculty(e.target.value)}
              placeholder="Faculty name"
              className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={async () => {
              if (newFaculty.trim()) {
                try {
                  await addFaculty(newFaculty.trim());
                  setNewFaculty('');
                  if (classData?.id) setFaculty(await services.getFaculties(classData.id));
                } catch (e) {
                  console.error('Failed to add faculty:', e);
                  showToast('Failed to add faculty', 'error');
                }
              }
            }}>Add</Button>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {faculty.map(f => (
              <div key={f.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-tertiary">
                <span className="text-sm text-text-primary">{f.name}</span>
                <button onClick={() => handleDeleteFaculty(f.id)} className="p-1 rounded text-text-tertiary hover:text-danger"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
