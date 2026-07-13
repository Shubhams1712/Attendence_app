import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as studentService from '@/services/students';
import type { Student, StudentFormData } from '@/types';

const STUDENT_KEYS = {
  all: ['students'] as const,
  list: (classId?: string) => [...STUDENT_KEYS.all, 'list', classId] as const,
  detail: (id: string) => [...STUDENT_KEYS.all, 'detail', id] as const,
  search: (query: string, classId?: string) => [...STUDENT_KEYS.all, 'search', query, classId] as const,
};

export function useStudents(classId?: string) {
  return useQuery({
    queryKey: STUDENT_KEYS.list(classId),
    queryFn: () => studentService.getStudents(classId),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: STUDENT_KEYS.detail(id),
    queryFn: () => studentService.getStudentById(id),
    enabled: !!id,
  });
}

export function useSearchStudents(query: string, classId?: string) {
  return useQuery({
    queryKey: STUDENT_KEYS.search(query, classId),
    queryFn: () => studentService.searchStudents(query, classId),
    enabled: query.length >= 1,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, classId }: { data: StudentFormData; classId: string }) =>
      studentService.createStudent(data, classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.all });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StudentFormData> }) =>
      studentService.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.all });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.all });
    },
  });
}

export function useImportStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ students, classId }: { students: StudentFormData[]; classId: string }) =>
      studentService.importStudents(students, classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.all });
    },
  });
}
