import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as services from '@/lib/services';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { calculateStats, calculatePercentage, formatDate } from '@/lib/utils';
import { BarChart3, Download, Search, TrendingDown, Users } from 'lucide-react';
import type { Student, AttendanceRecord } from '@/types';

interface StudentReport {
  student: Student;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export function ReportsPage() {
  const { classData } = useAuth();
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [threshold, setThreshold] = useState(75);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classData?.id) loadReports();
  }, [classData?.id]);

  const loadReports = async () => {
    if (!classData?.id) return;
    setLoading(true);
    try {
      const [students, allRecords, setting] = await Promise.all([
        services.getStudents(classData.id),
        services.getAllAttendanceRecords(classData.id),
        services.getSetting(classData.id, 'attendanceThreshold'),
      ]);
      if (setting) setThreshold(parseInt(setting) || 75);

      const reportData: StudentReport[] = students.map(student => {
        const studentRecords = allRecords.filter(r => r.student_id === student.id);
        const stats = calculateStats(studentRecords.map(r => r.status));
        return {
          student,
          total: stats.total,
          present: stats.present,
          absent: stats.absent,
          late: stats.late,
          percentage: calculatePercentage(stats.present, stats.late, stats.total),
        };
      });

      setReports(reportData);
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  };

  const belowThreshold = reports.filter(r => r.total > 0 && r.percentage < threshold).sort((a, b) => a.percentage - b.percentage);
  const sortedReports = [...reports].sort((a, b) => b.percentage - a.percentage);

  const handleExport = () => {
    let csv = 'Roll Number,Name,Total Lectures,Present,Absent,Late,Percentage\n';
    reports.forEach(r => {
      csv += `${r.student.roll_number},"${r.student.name || ''}",${r.total},${r.present},${r.absent},${r.late},${r.percentage}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-surface rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Attendance Reports</h2>
        <Button size="sm" variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {/* Summary */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{reports.length > 0 ? Math.round(reports.reduce((a, r) => a + r.percentage, 0) / reports.length) : 0}%</p>
            <p className="text-xs text-text-tertiary">Overall Class Average</p>
          </div>
        </div>
      </Card>

      {/* Below Threshold Alert */}
      {belowThreshold.length > 0 && (
        <Card className="p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">{belowThreshold.length} students below {threshold}%</p>
              <div className="mt-2 space-y-1">
                {belowThreshold.slice(0, 10).map(r => (
                  <p key={r.student.id} className="text-xs text-red-600 dark:text-red-400">
                    {r.student.name} — {r.percentage}%
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Student Reports */}
      <div className="space-y-2">
        {sortedReports.map(report => (
          <Card key={report.student.id} className={`p-3 ${report.total > 0 && report.percentage < threshold ? 'border-l-4 border-l-red-400' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-tertiary flex items-center justify-center text-xs font-bold text-text-secondary">
                  {report.student.roll_number}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{report.student.name}</p>
                  <p className="text-xs text-text-tertiary">
                    {report.total} lectures • P:{report.present} A:{report.absent} L:{report.late}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  report.total === 0 ? 'text-text-tertiary' :
                  report.percentage >= threshold ? 'text-green-600' :
                  report.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {report.total > 0 ? `${report.percentage}%` : 'N/A'}
                </p>
                {report.total > 0 && (
                  <div className="w-20 h-1.5 bg-surface-tertiary rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        report.percentage >= threshold ? 'bg-green-500' :
                        report.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(report.percentage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {reports.length === 0 && (
          <EmptyState icon={<Users className="w-8 h-8" />} title="No data yet" description="Add students and take attendance to see reports" />
        )}
      </div>
    </div>
  );
}
