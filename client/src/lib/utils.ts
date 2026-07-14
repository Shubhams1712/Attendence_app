import { clsx, type ClassValue } from 'clsx';
import type { AttendanceStats, AttendanceStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getCurrentAcademicYear(): string {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  if (month >= 6) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

export function getCurrentSemester(): number {
  const month = new Date().getMonth();
  return month >= 6 ? 1 : 2;
}

export function calculateStats(statuses: AttendanceStatus[]): AttendanceStats {
  const stats: AttendanceStats = {
    total: statuses.length,
    present: 0,
    absent: 0,
    late: 0,
    medical: 0,
    holiday: 0,
  };
  for (const s of statuses) {
    if (s === 'present') stats.present++;
    else if (s === 'absent') stats.absent++;
    else if (s === 'late') stats.late++;
    else if (s === 'medical') stats.medical++;
    else if (s === 'holiday') stats.holiday++;
  }
  return stats;
}

export function calculatePercentage(present: number, late: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((present + late) / total) * 100);
}

export function statusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
    case 'absent': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
    case 'late': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'medical': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    case 'holiday': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
  }
}

export function statusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'Present';
    case 'absent': return 'Absent';
    case 'late': return 'Late';
    case 'medical': return 'Medical Leave';
    case 'holiday': return 'Holiday';
  }
}

export function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function getDefaultSettings() {
  return {
    pin: '1234',
    className: 'Class',
    academicYear: getCurrentAcademicYear(),
    semester: String(getCurrentSemester()),
    attendanceThreshold: '75',
    darkMode: 'false',
  };
}
