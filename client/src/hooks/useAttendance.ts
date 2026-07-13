import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as attendanceService from '@/services/attendance';
import type { AttendanceStatus } from '@/types';

const ATTENDANCE_KEYS = {
  all: ['attendance'] as const,
  session: (sessionId: string) => [...ATTENDANCE_KEYS.all, 'session', sessionId] as const,
  student: (studentId: string) => [...ATTENDANCE_KEYS.all, 'student', studentId] as const,
  dateRange: (start: string, end: string) => [...ATTENDANCE_KEYS.all, 'dateRange', start, end] as const,
};

export function useAttendanceBySession(sessionId: string) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.session(sessionId),
    queryFn: () => attendanceService.getAttendanceBySession(sessionId),
    enabled: !!sessionId,
  });
}

export function useAttendanceByStudent(studentId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.student(studentId),
    queryFn: () => attendanceService.getAttendanceByStudent(studentId, startDate, endDate),
    enabled: !!studentId,
  });
}

export function useAttendanceByDateRange(startDate: string, endDate: string, subjectId?: string) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.dateRange(startDate, endDate),
    queryFn: () => attendanceService.getAttendanceByDateRange(startDate, endDate, subjectId),
    enabled: !!startDate && !!endDate,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      sessionId: string;
      studentId: string;
      subjectId: string;
      date: string;
      status: AttendanceStatus;
      markedBy: string;
    }) => attendanceService.markAttendance(
      params.sessionId,
      params.studentId,
      params.subjectId,
      params.date,
      params.status,
      params.markedBy
    ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.session(variables.sessionId) });
    },
  });
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      sessionId: string;
      subjectId: string;
      date: string;
      records: { student_id: string; status: AttendanceStatus }[];
      markedBy: string;
    }) => attendanceService.bulkMarkAttendance(
      params.sessionId,
      params.subjectId,
      params.date,
      params.records,
      params.markedBy
    ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.session(variables.sessionId) });
    },
  });
}

export function useSessionSummary(sessionId: string, totalStudents: number) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEYS.session(sessionId), 'summary'],
    queryFn: () => attendanceService.getSessionSummary(sessionId, totalStudents),
    enabled: !!sessionId && totalStudents > 0,
  });
}

export function useStudentAttendancePercentage(studentId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEYS.student(studentId), 'percentage', startDate, endDate],
    queryFn: () => attendanceService.getStudentAttendancePercentage(studentId, startDate, endDate),
    enabled: !!studentId && !!startDate && !!endDate,
  });
}
