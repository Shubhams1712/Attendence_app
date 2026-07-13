import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Award, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import type { Student } from '@/types';

const DEFAULT_CLASS_ID = '00000000-0000-0000-0000-000000000001';

interface StudentStats {
  name: string;
  percentage: number;
  total: number;
  present: number;
}

interface MonthlyData {
  month: string;
  attendance: number;
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [pieData, setPieData] = useState([
    { name: 'Present', value: 0, color: '#22c55e' },
    { name: 'Absent', value: 0, color: '#ef4444' },
    { name: 'Leave', value: 0, color: '#f59e0b' },
  ]);
  const [topStudents, setTopStudents] = useState<StudentStats[]>([]);
  const [lowStudents, setLowStudents] = useState<StudentStats[]>([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);

  useEffect(() => {
    const loadAnalytics = async () => {
      // Get all students
      const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', DEFAULT_CLASS_ID);

      if (!students || students.length === 0) return;

      // Get all attendance records for the last 6 months
      const sixMonthsAgo = format(subMonths(new Date(), 6), 'yyyy-MM-dd');

      const { data: records } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('students.class_id', DEFAULT_CLASS_ID)
        .gte('date', sixMonthsAgo);

      // Calculate monthly data
      const monthlyMap = new Map<string, { present: number; total: number }>();
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthKey = format(monthDate, 'MMM');
        monthlyMap.set(monthKey, { present: 0, total: 0 });
      }

      // Calculate per-student stats
      const studentStatsMap = new Map<string, { total: number; present: number; name: string }>();

      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLeave = 0;

      if (records) {
        for (const record of records) {
          const monthKey = format(new Date(record.date), 'MMM');
          const monthStats = monthlyMap.get(monthKey);
          if (monthStats) {
            monthStats.total++;
            if (record.status === 'present') monthStats.present++;
          }

          if (!studentStatsMap.has(record.student_id)) {
            const student = students.find((s) => s.id === record.student_id);
            studentStatsMap.set(record.student_id, {
              total: 0,
              present: 0,
              name: student?.full_name || 'Unknown',
            });
          }
          const stats = studentStatsMap.get(record.student_id)!;
          stats.total++;
          if (record.status === 'present') stats.present++;

          if (record.status === 'present') totalPresent++;
          else if (record.status === 'absent') totalAbsent++;
          else if (record.status === 'leave') totalLeave++;
        }
      }

      // Set monthly data
      const monthlyArray = Array.from(monthlyMap.entries()).map(([month, stats]) => ({
        month,
        attendance: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
      }));
      setMonthlyData(monthlyArray);

      // Set pie data
      const totalRecords = totalPresent + totalAbsent + totalLeave;
      if (totalRecords > 0) {
        setPieData([
          { name: 'Present', value: totalPresent, color: '#22c55e' },
          { name: 'Absent', value: totalAbsent, color: '#ef4444' },
          { name: 'Leave', value: totalLeave, color: '#f59e0b' },
        ]);
      }

      // Calculate student percentages
      const studentStatsArray: StudentStats[] = Array.from(studentStatsMap.values())
        .map((s) => ({
          name: s.name,
          percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
          total: s.total,
          present: s.present,
        }))
        .sort((a, b) => b.percentage - a.percentage);

      setTopStudents(studentStatsArray.slice(0, 5));
      setLowStudents(studentStatsArray.slice(-5).reverse());

      // Calculate totals
      setTotalClasses(totalRecords);
      setAvgAttendance(totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0);
    };

    loadAnalytics();
  }, []);

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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgAttendance}%</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={16} className="text-primary-600" />
                <span className="text-xs text-gray-500">Total Records</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalClasses}</p>
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
                {topStudents.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
                ) : (
                  topStudents.map((s, i) => (
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
                  ))
                )}
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
                {lowStudents.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
                ) : (
                  lowStudents.map((s, i) => (
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
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
