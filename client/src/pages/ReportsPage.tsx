import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, BookOpen, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import { useStudents } from '@/hooks/useStudents';
import { supabase } from '@/lib/supabase';
import { exportToPDF, exportToExcel, exportToCSV } from '@/lib/share';
import toast from 'react-hot-toast';
import type { Student, AttendanceRecord } from '@/types';

const DEFAULT_CLASS_ID = '00000000-0000-0000-0000-000000000001';

const reportTypes = [
  { id: 'daily', label: 'Daily', icon: <Calendar size={14} /> },
  { id: 'weekly', label: 'Weekly', icon: <Calendar size={14} /> },
  { id: 'monthly', label: 'Monthly', icon: <Calendar size={14} /> },
  { id: 'student', label: 'Student', icon: <User size={14} /> },
  { id: 'subject', label: 'Subject', icon: <BookOpen size={14} /> },
];

const exportFormats = [
  { id: 'pdf', label: 'PDF Report', icon: <FileText size={20} className="text-danger-600" />, color: 'bg-danger-50 dark:bg-danger-500/10' },
  { id: 'excel', label: 'Excel Sheet', icon: <FileText size={20} className="text-success-600" />, color: 'bg-success-50 dark:bg-success-500/10' },
  { id: 'csv', label: 'CSV File', icon: <FileText size={20} className="text-primary-600" />, color: 'bg-primary-50 dark:bg-primary-500/10' },
];

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0] || '');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: students = [] } = useStudents(DEFAULT_CLASS_ID);

  const handleExport = async (format: string) => {
    setIsGenerating(true);
    try {
      // Fetch attendance records for the selected date
      const { data: records } = await supabase
        .from('attendance_records')
        .select('*, students:student_id (full_name, roll_number, gender)')
        .eq('date', selectedDate)
        .eq('students.class_id', DEFAULT_CLASS_ID);

      if (!records || records.length === 0) {
        toast.error('No attendance records found for this date');
        setIsGenerating(false);
        return;
      }

      const shareData = {
        className: 'BSc IT Third Year',
        subject: selectedSubject === 'all' ? 'All Subjects' : selectedSubject,
        teacher: 'Teacher',
        date: selectedDate,
        records: records.map((r) => ({
          student: r.students as unknown as Student,
          status: r.status as 'present' | 'absent' | 'leave' | 'unmarked',
        })),
        summary: {
          date: selectedDate,
          subject_id: selectedSubject,
          total_students: students.length,
          present: records.filter((r) => r.status === 'present').length,
          absent: records.filter((r) => r.status === 'absent').length,
          leave: records.filter((r) => r.status === 'leave').length,
          unmarked: students.length - records.length,
          percentage: students.length > 0
            ? Math.round((records.filter((r) => r.status === 'present').length / students.length) * 100)
            : 0,
        },
      };

      const filename = `attendance-${selectedDate}`;

      if (format === 'pdf') {
        await exportToPDF(shareData, filename);
      } else if (format === 'excel') {
        exportToExcel(shareData, filename);
      } else if (format === 'csv') {
        exportToCSV(shareData, filename);
      }

      toast.success(`${format.toUpperCase()} report downloaded!`);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Reports</h1>
        <Tabs
          tabs={reportTypes.map((r) => ({ id: r.id, label: r.label, icon: r.icon }))}
          activeTab={activeReport}
          onChange={setActiveReport}
        />
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3 mb-4">
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
          />
        </div>
        <Select
          label="Subject"
          value={selectedSubject}
          onChange={setSelectedSubject}
          options={[
            { value: 'all', label: 'All Subjects' },
          ]}
        />
      </motion.div>

      {/* Export Options */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="section-title">Export Report</h3>
        <div className="space-y-2">
          {exportFormats.map((fmt, i) => (
            <motion.div
              key={fmt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
            >
              <Card interactive padding="sm" onClick={() => handleExport(fmt.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${fmt.color}`}>
                    {fmt.icon}
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm flex-1">{fmt.label}</p>
                  <Download size={18} className="text-gray-400" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
