import type { AttendanceRecord, Student, Session, Subject, Faculty } from '@/types';
import { formatDate, calculateStats } from './utils';

export function generateAttendanceReport(
  session: Session,
  subject: Subject | undefined,
  faculty: Faculty | undefined,
  students: Student[],
  records: AttendanceRecord[]
): string {
  const stats = calculateStats(records.map(r => r.status));
  const absentStudents = records
    .filter(r => r.status === 'absent')
    .map(r => {
      const s = students.find(st => st.id === r.student_id);
      return s ? `${s.roll_number} ${s.name}` : '';
    })
    .filter(Boolean);

  const report = [
    '📋 Attendance Report',
    '',
    `Date: ${formatDate(session.date)}`,
    `Time: ${session.time}`,
    `Subject: ${subject?.name || 'N/A'}`,
    `Faculty: ${faculty?.name || 'N/A'}`,
    `Lecture: ${session.lecture_number}`,
    `Classroom: ${session.classroom || 'N/A'}`,
    '',
    `Present: ${stats.present}`,
    `Absent: ${stats.absent}`,
    `Late: ${stats.late}`,
    `Medical Leave: ${stats.medical}`,
    `Holiday: ${stats.holiday}`,
    `Total: ${stats.total}`,
    '',
    `Attendance: ${Math.round(((stats.present + stats.late) / stats.total) * 100)}%`,
    '',
  ];

  if (absentStudents.length > 0) {
    report.push('Absent Students:');
    absentStudents.forEach(s => report.push(s));
    report.push('');
  }

  report.push('Prepared By');
  report.push('Class Representative');

  return report.join('\n');
}

export function generateStudentReport(
  student: Student,
  totalLectures: number,
  present: number,
  absent: number,
  late: number,
): string {
  const percentage = totalLectures > 0 ? Math.round(((present + late) / totalLectures) * 100) : 0;

  const report = [
    '📊 Student Attendance Report',
    '',
    `Name: ${student.name}`,
    `Roll Number: ${student.roll_number}`,
    '',
    `Total Lectures: ${totalLectures}`,
    `Present: ${present}`,
    `Absent: ${absent}`,
    `Late: ${late}`,
    `Attendance: ${percentage}%`,
    '',
    'Prepared By',
    'Class Representative',
  ];

  return report.join('\n');
}

export function exportToCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(',')];
  rows.forEach(row => lines.push(row.map(escape).join(',')));
  return lines.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareContent(title: string, text: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}
