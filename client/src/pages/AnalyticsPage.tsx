import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Award, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'Jan', attendance: 92 },
  { month: 'Feb', attendance: 88 },
  { month: 'Mar', attendance: 95 },
  { month: 'Apr', attendance: 90 },
  { month: 'May', attendance: 87 },
  { month: 'Jun', attendance: 93 },
];

const pieData = [
  { name: 'Present', value: 58, color: '#22c55e' },
  { name: 'Absent', value: 3, color: '#ef4444' },
  { name: 'Leave', value: 1, color: '#f59e0b' },
];

const topStudents = [
  { name: 'Aarav Patel', percentage: 98 },
  { name: 'Priya Sharma', percentage: 96 },
  { name: 'Rohan Gupta', percentage: 95 },
];

const lowStudents = [
  { name: 'Vikram Desai', percentage: 65 },
  { name: 'Meera Joshi', percentage: 72 },
  { name: 'Arjun Reddy', percentage: 75 },
];

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Analytics</h1>
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'students', label: 'Students' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </motion.div>

      {activeTab === 'overview' ? (
        <div className="space-y-4">
          {/* Stats Cards */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3">
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-success-600" />
                <span className="text-xs text-gray-500">Avg Attendance</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">91%</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={16} className="text-primary-600" />
                <span className="text-xs text-gray-500">Total Classes</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">48</p>
            </Card>
          </motion.div>

          {/* Monthly Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <h3 className="section-title">Monthly Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="attendance" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <h3 className="section-title">Overall Distribution</h3>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Most Present */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Award size={18} className="text-success-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Most Present</h3>
              </div>
              <div className="space-y-2">
                {topStudents.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1">
                        <div className="h-full bg-success-500 rounded-full" style={{ width: `${s.percentage}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-success-600">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Lowest Attendance */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-danger-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Lowest Attendance</h3>
              </div>
              <div className="space-y-2">
                {lowStudents.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1">
                        <div className="h-full bg-danger-500 rounded-full" style={{ width: `${s.percentage}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-danger-600">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
