import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, BookOpen, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

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

  const handleExport = (format: string) => {
    toast.success(`Generating ${format.toUpperCase()} report...`);
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
        <Select
          label="Subject"
          value=""
          onChange={() => {}}
          options={[
            { value: 'all', label: 'All Subjects' },
            { value: '1', label: 'Data Structures' },
            { value: '2', label: 'Operating Systems' },
            { value: '3', label: 'Database Management' },
          ]}
        />
        <Select
          label="Teacher"
          value=""
          onChange={() => {}}
          options={[
            { value: 'all', label: 'All Teachers' },
            { value: '1', label: 'Dr. Smith' },
            { value: '2', label: 'Prof. Johnson' },
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
