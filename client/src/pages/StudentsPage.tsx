import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Upload,
  Download,
  Edit3,
  Trash2,
  FileSpreadsheet,
  FileText,
  UserPlus,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import type { Student } from '@shared/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const studentSchema = z.object({
  roll_number: z.string().min(1, 'Roll number is required'),
  full_name: z.string().min(2, 'Name is required'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

type StudentForm = z.infer<typeof studentSchema>;

const DEMO_STUDENTS: Student[] = [
  { id: '1', roll_number: '001', full_name: 'Aarav Patel', gender: 'male', status: 'active', class_id: '1', created_at: '', updated_at: '' },
  { id: '2', roll_number: '002', full_name: 'Priya Sharma', gender: 'female', status: 'active', class_id: '1', created_at: '', updated_at: '' },
  { id: '3', roll_number: '003', full_name: 'Rohan Gupta', gender: 'male', status: 'active', class_id: '1', created_at: '', updated_at: '' },
  { id: '4', roll_number: '004', full_name: 'Ananya Singh', gender: 'female', status: 'active', class_id: '1', created_at: '', updated_at: '' },
  { id: '5', roll_number: '005', full_name: 'Vikram Desai', gender: 'male', status: 'active', class_id: '1', created_at: '', updated_at: '' },
];

export function StudentsPage() {
  const [students, setStudents] = useState(DEMO_STUDENTS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
  });

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.roll_number.includes(q) ||
        s.phone?.includes(q)
    );
  }, [students, search]);

  const openAddModal = () => {
    setEditingStudent(null);
    reset();
    setShowAddModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    reset({
      roll_number: student.roll_number,
      full_name: student.full_name,
      gender: student.gender,
      phone: student.phone || '',
      email: student.email || '',
    });
    setShowAddModal(true);
  };

  const onSubmit = (data: StudentForm) => {
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id ? { ...s, ...data } : s
        )
      );
      toast.success('Student updated!');
    } else {
      const newStudent: Student = {
        id: crypto.randomUUID(),
        ...data,
        status: 'active',
        class_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: data.email || undefined,
        phone: data.phone || undefined,
      };
      setStudents((prev) => [...prev, newStudent]);
      toast.success('Student added!');
    }
    setShowAddModal(false);
    reset();
  };

  const deleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success('Student deleted');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{students.length} students enrolled</p>
          </div>
          <Button size="sm" icon={<Plus size={16} />} onClick={openAddModal}>
            Add
          </Button>
        </div>

        <SearchInput value={search} onChange={setSearch} placeholder="Search students..." />
      </motion.div>

      {/* Action Buttons */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
        <Button size="sm" variant="secondary" icon={<Upload size={14} />} onClick={() => setShowImportModal(true)}>
          Import
        </Button>
        <Button size="sm" variant="secondary" icon={<Download size={14} />}>
          Export
        </Button>
      </motion.div>

      {/* Student List */}
      {loading ? (
        <CardSkeleton count={5} />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={<UserPlus size={32} />}
          title="No Students Found"
          description={search ? 'Try a different search term' : 'Add students to get started'}
          action={!search ? <Button onClick={openAddModal}>Add First Student</Button> : undefined}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredStudents.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card padding="sm" className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 rounded-xl flex items-center justify-center text-sm font-bold">
                      {student.roll_number}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {student.full_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {student.gender === 'male' ? '♂' : student.gender === 'female' ? '♀' : '⚪'} {student.phone || 'No phone'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(student)}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Edit3 size={16} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="p-2 rounded-xl hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                    >
                      <Trash2 size={16} className="text-danger-400" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title={editingStudent ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Roll Number" placeholder="001" error={errors.roll_number?.message} {...register('roll_number')} />
          <Input label="Full Name" placeholder="John Doe" error={errors.full_name?.message} {...register('full_name')} />
          <div>
            <label className="label">Gender</label>
            <div className="flex gap-2">
              {(['male', 'female', 'other'] as const).map((g) => (
                <label key={g} className="flex-1">
                  <input type="radio" value={g} {...register('gender')} className="sr-only peer" />
                  <div className="text-center py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-500/10 capitalize text-sm font-medium cursor-pointer transition-all">
                    {g}
                  </div>
                </label>
              ))}
            </div>
          </div>
          <Input label="Phone (optional)" placeholder="+91 98765 43210" {...register('phone')} />
          <Input label="Email (optional)" type="email" placeholder="student@email.com" {...register('email')} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-[2]">
              {editingStudent ? 'Update' : 'Add Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal open={showImportModal} onClose={() => setShowImportModal(false)} title="Import Students">
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Upload a CSV or Excel file with columns: Roll Number, Full Name, Gender, Phone, Email
          </p>
          <button
            onClick={() => toast.success('Excel import coming soon!')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-400 transition-colors"
          >
            <FileSpreadsheet size={24} className="text-success-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Excel File</p>
              <p className="text-xs text-gray-500">.xlsx, .xls</p>
            </div>
          </button>
          <button
            onClick={() => toast.success('CSV import coming soon!')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-400 transition-colors"
          >
            <FileText size={24} className="text-primary-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">CSV File</p>
              <p className="text-xs text-gray-500">.csv</p>
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
}
