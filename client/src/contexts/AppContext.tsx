import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import * as services from '@/lib/services';
import { useAuth } from './AuthContext';
import type { Student, Subject, Faculty, AttendanceStatus } from '@/types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  action?: { label: string; onClick: () => void };
}

interface AppContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], action?: Toast['action']) => void;
  removeToast: (id: number) => void;

  // Students
  getStudents: () => Promise<Student[]>;
  addStudent: (rollNumber: number, name: string, notes?: string) => Promise<void>;
  updateStudent: (id: string, rollNumber: number, name: string, notes?: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  bulkAddStudents: (students: { rollNumber: number; name: string; notes?: string }[]) => Promise<void>;

  // Subjects
  getSubjects: () => Promise<Subject[]>;
  addSubject: (name: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Faculty
  getFaculties: () => Promise<Faculty[]>;
  addFaculty: (name: string) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;

  // Sessions
  createSession: (date: string, time: string, subjectId: string, facultyId: string, lectureNumber: number, classroom: string) => Promise<string>;
  saveAttendanceRecord: (sessionId: string, studentId: string, status: AttendanceStatus) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, classData } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', action?: Toast['action']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getClassId = useCallback((): string => {
    if (!classData?.id) throw new Error('No class selected');
    return classData.id;
  }, [classData]);

  const getUserId = useCallback((): string => {
    if (!user?.id) throw new Error('Not authenticated');
    return user.id;
  }, [user]);

  // Read operations
  const getStudents = useCallback(async (): Promise<Student[]> => {
    return await services.getStudents(getClassId());
  }, [getClassId]);

  const getSubjects = useCallback(async (): Promise<Subject[]> => {
    return await services.getSubjects(getClassId());
  }, [getClassId]);

  const getFaculties = useCallback(async (): Promise<Faculty[]> => {
    return await services.getFaculties(getClassId());
  }, [getClassId]);

  // Student operations
  const addStudent = useCallback(async (rollNumber: number, name: string, notes = '') => {
    await services.addStudent(getClassId(), rollNumber, name, notes, getUserId());
  }, [getClassId, getUserId]);

  const updateStudent = useCallback(async (id: string, rollNumber: number, name: string, notes = '') => {
    await services.updateStudent(id, getClassId(), rollNumber, name, notes);
  }, [getClassId]);

  const deleteStudent = useCallback(async (id: string) => {
    await services.deleteStudent(id);
  }, []);

  const bulkAddStudents = useCallback(async (students: { rollNumber: number; name: string; notes?: string }[]) => {
    await services.bulkAddStudents(
      getClassId(),
      students.map(s => ({ roll_number: s.rollNumber, name: s.name, notes: s.notes })),
      getUserId()
    );
  }, [getClassId, getUserId]);

  // Subject operations
  const addSubject = useCallback(async (name: string) => {
    await services.addSubject(getClassId(), name, getUserId());
  }, [getClassId, getUserId]);

  const deleteSubject = useCallback(async (id: string) => {
    await services.deleteSubject(id);
  }, []);

  // Faculty operations
  const addFaculty = useCallback(async (name: string) => {
    await services.addFaculty(getClassId(), name, getUserId());
  }, [getClassId, getUserId]);

  const deleteFaculty = useCallback(async (id: string) => {
    await services.deleteFaculty(id);
  }, []);

  // Session operations
  const createSession = useCallback(async (
    date: string, time: string, subjectId: string, facultyId: string,
    lectureNumber: number, classroom: string
  ): Promise<string> => {
    return await services.createSession(
      getClassId(), date, time, subjectId, facultyId, lectureNumber, classroom, getUserId()
    );
  }, [getClassId, getUserId]);

  const saveAttendanceRecord = useCallback(async (
    sessionId: string, studentId: string, status: AttendanceStatus
  ) => {
    await services.saveAttendanceRecord(sessionId, studentId, status, getUserId());
  }, [getUserId]);

  const deleteSession = useCallback(async (id: string) => {
    await services.deleteSession(id);
  }, []);

  return (
    <AppContext.Provider value={{
      toasts, showToast, removeToast,
      getStudents, addStudent, updateStudent, deleteStudent, bulkAddStudents,
      getSubjects, addSubject, deleteSubject,
      getFaculties, addFaculty, deleteFaculty,
      createSession, saveAttendanceRecord, deleteSession,
    }}>
      {children}
      {/* Toast notifications */}
      <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-slide-up rounded-xl px-4 py-3 shadow-lg text-sm font-medium flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-green-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="font-semibold underline underline-offset-2"
              >
                {toast.action.label}
              </button>
            )}
            <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
