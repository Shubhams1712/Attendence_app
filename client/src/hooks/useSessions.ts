import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as sessionService from '@/services/sessions';

const SESSION_KEYS = {
  all: ['sessions'] as const,
  today: (classId: string) => [...SESSION_KEYS.all, 'today', classId] as const,
  detail: (id: string) => [...SESSION_KEYS.all, 'detail', id] as const,
  range: (classId: string, start: string, end: string) =>
    [...SESSION_KEYS.all, 'range', classId, start, end] as const,
  history: (classId: string, limit: number, offset: number) =>
    [...SESSION_KEYS.all, 'history', classId, limit, offset] as const,
};

export function useTodaySessions(classId: string) {
  return useQuery({
    queryKey: SESSION_KEYS.today(classId),
    queryFn: () => sessionService.getTodaySessions(classId),
    enabled: !!classId,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: SESSION_KEYS.detail(id),
    queryFn: () => sessionService.getSessionById(id),
    enabled: !!id,
  });
}

export function useSessionsByDateRange(classId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: SESSION_KEYS.range(classId, startDate, endDate),
    queryFn: () => sessionService.getSessionsByDateRange(classId, startDate, endDate),
    enabled: !!classId && !!startDate && !!endDate,
  });
}

export function useSessionHistory(classId: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: SESSION_KEYS.history(classId, limit, offset),
    queryFn: () => sessionService.getSessionsWithDetails(classId, limit, offset),
    enabled: !!classId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sessionService.createSession,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.today(variables.class_id) });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sessionService.completeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.all });
    },
  });
}

export function useCancelSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sessionService.cancelSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.all });
    },
  });
}
