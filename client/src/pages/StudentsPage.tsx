import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePIN } from '@/contexts/PINContext';
import { getStudents } from '@/lib/services';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { PINDialog } from '@/components/layout/PINDialog';
import {
  Users, Plus, Edit2, Trash2, Download, Upload,
  UserPlus, FileSpreadsheet, ChevronDown, Search, X, Save
} from 'lucide-react';
import type { Student } from '@/types';
import { exportToCSV, downloadFile } from '@/lib/share';

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'roll_number' | 'name'>('roll_number');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Student | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPIN, setShowPIN] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  const { addStudent, updateStudent, deleteStudent, bulkAddStudents, showToast } = useApp();
  const { classData } = useAuth();
  const { isVerified, lock } = usePIN();

  const [formData, setFormData] = useState({ rollNumber: '', name: '', notes: '' });
  const [bulkText, setBulkText] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    if (!classData?.id) return;
    setLoading(true);
    try {
      const all = await getStudents(classData.id);
      setStudents(all);
    } catch (e) {
      console.error('Failed to load students:', e);
      showToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVerified && pendingAction) {
      pendingAction();
      setPendingAction(() => {});
    }
  }, [isVerified, pendingAction]);

  const requireAuth = (action: () => void) => {
    if (isVerified) {
      action();
    } else {
      setPendingAction(() => action);
      setShowPIN(true);
    }
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) || String(s.roll_number).includes(q) || (s.notes || '').toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'roll_number') return a.roll_number - b.roll_number;
    return (a.name || '').localeCompare(b.name || '');
  });

  const handleAdd = async () => {
    setFormError('');
    const roll = parseInt(formData.rollNumber);
    if (!roll || !formData.name.trim()) {
      setFormError('Roll number and name are required');
      return;
    }
    try {
      await addStudent(roll, formData.name.trim(), formData.notes.trim());
      setShowAddModal(false);
      setFormData({ rollNumber: '', name: '', notes: '' });
      showToast('Student added', 'success');
      await loadStudents();
    } catch (e: any) {
      console.error('Add student error:', e);
      setFormError(e.message);
    }
  };

  const handleEdit = async () => {
    if (!showEditModal) return;
    setFormError('');
    const roll = parseInt(formData.rollNumber);
    if (!roll || !formData.name.trim()) {
      setFormError('Roll number and name are required');
      return;
    }
    try {
      await updateStudent(showEditModal.id, roll, formData.name.trim(), formData.notes.trim());
      setShowEditModal(null);
      showToast('Student updated', 'success');
      await loadStudents();
    } catch (e: any) {
      console.error('Update student error:', e);
      setFormError(e.message);
    }
  };

  const handleDelete = async (student: Student) => {
    if (confirm(`Delete ${student.name} (Roll ${student.roll_number})? This cannot be undone.`)) {
      try {
        await deleteStudent(student.id);
        showToast('Student deleted', 'success');
        await loadStudents();
      } catch (e: any) {
        console.error('Delete student error:', e);
        showToast(e.message || 'Failed to delete student', 'error');
      }
    }
  };

  const handleBulkAdd = async () => {
    const lines = bulkText.trim().split('\n').filter(Boolean);
    const parsed = lines.map(line => {
      const parts = line.split(/[,;\t]+/);
      const roll = parseInt(parts[0].trim());
      const name = (parts[1] || '').trim();
      const notes = (parts[2] || '').trim();
      return { rollNumber: roll, name, notes };
    }).filter(s => s.rollNumber && s.name);
    if (parsed.length === 0) {
      setFormError('No valid entries found. Use format: Roll, Name, Notes');
      return;
    }
    try {
      await bulkAddStudents(parsed);
      setShowBulkModal(false);
      setBulkText('');
      showToast(`${parsed.length} students added`, 'success');
      await loadStudents();
    } catch (e: any) {
      console.error('Bulk add error:', e);
      setFormError(e.message);
    }
  };

  const handleExport = () => {
    const headers = ['Roll Number', 'Name', 'Notes'];
    const rows = students.map(s => [String(s.roll_number), s.name || '', s.notes || '']);
    const csv = exportToCSV(headers, rows);
    downloadFile(csv, 'students.csv', 'text/csv');
    showToast('Students exported', 'success');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.tsv,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      const students: { rollNumber: number; name: string; notes?: string }[] = [];
      for (const line of lines) {
        const parts = line.split(/[,;\t]+/);
        const roll = parseInt(parts[0].trim());
        const name = (parts[1] || '').trim();
        if (roll && name) students.push({ rollNumber: roll, name, notes: parts[2]?.trim() });
      }
      if (students.length > 0) {
        try {
          await bulkAddStudents(students);
          showToast(`${students.length} students imported`, 'success');
          await loadStudents();
        } catch (e: any) {
          console.error('Import error:', e);
          showToast(e.message || 'Import failed', 'error');
        }
      }
    };
    input.click();
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search students..." className="flex-1" />
        <button onClick={() => setSortBy(s => s === 'roll_number' ? 'name' : 'roll_number')}
          className="p-2.5 rounded-xl bg-surface border border-border text-text-secondary hover:bg-surface-tertiary transition-colors">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2">
        <Button size="sm" icon={<Plus className="w-4 h-4" />}
          onClick={() => requireAuth(() => { setFormData({ rollNumber: '', name: '', notes: '' }); setShowAddModal(true); })}>
          Add
        </Button>
        <Button size="sm" variant="secondary" icon={<UserPlus className="w-4 h-4" />}
          onClick={() => requireAuth(() => { setBulkText(''); setShowBulkModal(true); })}>
          Bulk
        </Button>
        <Button size="sm" variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export</Button>
        <Button size="sm" variant="secondary" icon={<Upload className="w-4 h-4" />} onClick={handleImport}>Import</Button>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-surface rounded-xl" />)}
        </div>
      ) : students.length === 0 && !search ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No students yet"
          description="Add your first student to get started"
          action={<Button icon={<Plus className="w-4 h-4" />}
            onClick={() => requireAuth(() => { setShowAddModal(true); })}>Add Student</Button>}
        />
      ) : sorted.length === 0 ? (
        <EmptyState icon={<Search className="w-8 h-8" />} title="No results" description="Try a different search" />
      ) : (
        <div className="space-y-2">
          {sorted.map(student => (
            <Card key={student.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-sm font-bold text-primary-600">
                  {student.roll_number}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{student.name}</p>
                  {student.notes && <p className="text-xs text-text-tertiary">{student.notes}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => requireAuth(() => {
                  setFormData({ rollNumber: String(student.roll_number), name: student.name, notes: student.notes || '' });
                  setShowEditModal(student);
                })}
                  className="p-2 rounded-lg text-text-tertiary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => requireAuth(() => handleDelete(student))}
                  className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-bg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Student Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Student">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Roll Number</label>
            <input type="number" value={formData.rollNumber} onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Notes (optional)</label>
            <input type="text" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <Button onClick={handleAdd} className="w-full" icon={<Save className="w-4 h-4" />}>Add Student</Button>
        </div>
      </Modal>

      {/* Edit Student Modal */}
      <Modal open={!!showEditModal} onClose={() => setShowEditModal(null)} title="Edit Student">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Roll Number</label>
            <input type="number" value={formData.rollNumber} onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
            <input type="text" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <Button onClick={handleEdit} className="w-full" icon={<Save className="w-4 h-4" />}>Update Student</Button>
        </div>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal open={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Add Students">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            One student per line: <code className="bg-surface-tertiary px-1.5 py-0.5 rounded text-xs">Roll, Name, Notes</code>
          </p>
          <textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            rows={8}
            placeholder="1, John Doe&#10;2, Jane Smith, Class monitor&#10;3, Bob Wilson"
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono"
          />
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <Button onClick={handleBulkAdd} className="w-full" icon={<UserPlus className="w-4 h-4" />}>Add Students</Button>
        </div>
      </Modal>

      <PINDialog open={showPIN} onClose={() => setShowPIN(false)} />
    </div>
  );
}
