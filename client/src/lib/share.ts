import type { AttendanceRecord, Student, Session, Subject, Faculty } from '@/types';
import { formatDate } from './utils';

function padRoll(n: number): string {
  return String(n).padStart(2, '0');
}

const SEP = '━━━━━━━━━━━━━━━━━━━━';

export function generateAttendanceReport(
  session: Session,
  subject: Subject | undefined,
  faculty: Faculty | undefined,
  students: Student[],
  records: AttendanceRecord[]
): string {
  const studentMap = new Map(students.map(s => [s.id, s]));

  const presentRecords = records.filter(r => r.status === 'present');
  const absentRecords = records.filter(r => r.status === 'absent');
  const lateRecords = records.filter(r => r.status === 'late');
  const medicalRecords = records.filter(r => r.status === 'medical');
  const holidayRecords = records.filter(r => r.status === 'holiday');

  const totalStudents = students.length;
  const presentCount = presentRecords.length;

  const presentRolls = presentRecords
    .map(r => studentMap.get(r.student_id))
    .filter((s): s is Student => !!s)
    .sort((a, b) => a.roll_number - b.roll_number)
    .map(s => padRoll(s.roll_number));

  const absentRolls = absentRecords
    .map(r => studentMap.get(r.student_id))
    .filter((s): s is Student => !!s)
    .sort((a, b) => a.roll_number - b.roll_number)
    .map(s => padRoll(s.roll_number));

  const percentage =
    totalStudents > 0
      ? ((presentCount / totalStudents) * 100).toFixed(2)
      : "0.00";

  const lines: string[] = [];

  lines.push("📋 ATTENDANCE REPORT");
  lines.push("");

  lines.push(
    `📅 ${formatDate(session.date)} | 🕒 ${session.time || "N/A"}`
  );

  lines.push(
    `📚 ${subject?.name || "N/A"} | 👨‍🏫 ${faculty?.name || "N/A"} | L-${session.lecture_number ?? "-"}`
  );

  if (session.classroom) {
    lines.push(`🏫 ${session.classroom}`);
  }

  lines.push("");

  lines.push(`👥 Total : ${totalStudents}`);
  lines.push(`✅ Present : ${presentCount}`);
  lines.push(`❌ Absent : ${absentRecords.length}`);
  lines.push(`📊 Attendance : ${percentage}%`);

  lines.push("");

  lines.push("✅ Present Roll Nos.");
  lines.push(
    presentRolls.length
      ? presentRolls.join(", ")
      : "None"
  );

  lines.push("");

  lines.push("❌ Absent Roll Nos.");
  lines.push(
    absentRolls.length
      ? absentRolls.join(", ")
      : "None"
  );

  lines.push("");

  lines.push("— Class Representative");

  return lines.join("\n");
}

export function generateStudentReport(
  student: Student,
  totalLectures: number,
  present: number,
  absent: number,
  late: number,
): string {
  const percentage = totalLectures > 0 ? Math.round(((present + late) / totalLectures) * 100) : 0;

  const lines: string[] = [];

  lines.push(SEP);
  lines.push('📊 STUDENT ATTENDANCE REPORT');
  lines.push(SEP);
  lines.push('');
  lines.push(`Name        : ${student.name}`);
  lines.push(`Roll Number : ${padRoll(student.roll_number)}`);
  lines.push('');
  lines.push(SEP);
  lines.push('');
  lines.push(`Total Lectures : ${totalLectures}`);
  lines.push(`Present        : ${present}`);
  lines.push(`Absent         : ${absent}`);
  lines.push(`Late           : ${late}`);
  lines.push('');
  lines.push(`Attendance : ${percentage}%`);
  lines.push('');
  lines.push(SEP);
  lines.push('');
  lines.push('Prepared By');
  lines.push('');
  lines.push('Class Representative');
  lines.push('');
  lines.push(SEP);

  return lines.join('\n');
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
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}
