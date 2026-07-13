import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  BookOpen,
  Clock,
  Bell,
  Database,
  Upload,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  LogOut,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface SettingsSection {
  title: string;
  items: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onClick?: () => void;
    color: string;
  }[];
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  

  const sections: SettingsSection[] = [
    {
      title: 'Institute',
      items: [
        { icon: <Building2 size={20} />, label: 'Institute Name', value: 'ABC College', onClick: () => toast('Edit institute name'), color: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10' },
        { icon: <BookOpen size={20} />, label: 'Department', value: 'Computer Science', onClick: () => {}, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
        { icon: <Clock size={20} />, label: 'Academic Year', value: '2025-2026', onClick: () => {}, color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10' },
      ],
    },
    {
      title: 'Academics',
      items: [
        { icon: <BookOpen size={20} />, label: 'Subjects', value: '6 subjects', onClick: () => setShowSubjectModal(true), color: 'text-success-600 bg-success-50 dark:bg-success-500/10' },
        { icon: <Clock size={20} />, label: 'Lecture Timings', value: 'Customize', onClick: () => toast('Lecture timings'), color: 'text-warning-600 bg-warning-50 dark:bg-warning-500/10' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: <Bell size={20} />, label: 'Reminder Before Lecture', value: '10 min', onClick: () => toast('Notification settings'), color: 'text-danger-600 bg-danger-50 dark:bg-danger-500/10' },
      ],
    },
    {
      title: 'Data',
      items: [
        { icon: <Database size={20} />, label: 'Export Database', onClick: () => toast.success('Exporting database...'), color: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10' },
        { icon: <Upload size={20} />, label: 'Restore Backup', onClick: () => toast('Restore feature'), color: 'text-success-600 bg-success-50 dark:bg-success-500/10' },
      ],
    },
  ];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure your attendance system</p>
      </motion.div>

      {/* User Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-500/20 rounded-2xl flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{user?.full_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </Card>
      </motion.div>

      {/* Theme Switcher */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
        <h3 className="section-title">Appearance</h3>
        <Card>
          <div className="flex gap-2">
            {[
              { value: 'light' as const, icon: <Sun size={18} />, label: 'Light' },
              { value: 'dark' as const, icon: <Moon size={18} />, label: 'Dark' },
              { value: 'system' as const, icon: <Monitor size={18} />, label: 'System' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  theme === opt.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {opt.icon}
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Settings Sections */}
      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + si * 0.05 }}
          className="mb-4"
        >
          <h3 className="section-title">{section.title}</h3>
          <Card padding="none">
            {section.items.map((item, i) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  i > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                  {item.icon}
                </div>
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                {item.value && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 mr-1">{item.value}</span>
                )}
                <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
              </button>
            ))}
          </Card>
        </motion.div>
      ))}

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Button
          variant="ghost"
          fullWidth
          icon={<LogOut size={18} />}
          onClick={signOut}
          className="text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10"
        >
          Sign Out
        </Button>
      </motion.div>

      {/* Subjects Modal */}
      <Modal open={showSubjectModal} onClose={() => setShowSubjectModal(false)} title="Manage Subjects">
        <div className="space-y-3">
          {['Data Structures', 'Operating Systems', 'Database Management', 'Computer Networks', 'Software Engineering', 'Web Development'].map((sub) => (
            <div key={sub} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{sub}</span>
              <button className="text-xs text-danger-500 hover:text-danger-600">Remove</button>
            </div>
          ))}
          <Button variant="secondary" fullWidth size="sm" onClick={() => toast('Add subject')}>+ Add Subject</Button>
        </div>
      </Modal>
    </div>
  );
}
