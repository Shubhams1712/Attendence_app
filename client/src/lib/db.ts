import Dexie, { type Table } from 'dexie';
import type {
  Student,
  Subject,
  Faculty,
  Session,
  AttendanceRecord,
  Settings,
} from '@/types';

export class AttendanceDB extends Dexie {
  students!: Table<Student, number>;
  subjects!: Table<Subject, number>;
  faculty!: Table<Faculty, number>;
  sessions!: Table<Session, number>;
  attendanceRecords!: Table<AttendanceRecord, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super('AttendanceRegister');
    this.version(1).stores({
      students: '++id, rollNumber, name, createdAt',
      subjects: '++id, name, createdAt',
      faculty: '++id, name, createdAt',
      sessions: '++id, date, subjectId, facultyId, lectureNumber',
      attendanceRecords: '++id, sessionId, studentId, status',
      settings: '++id, key',
    });
  }
}

export const db = new AttendanceDB();
