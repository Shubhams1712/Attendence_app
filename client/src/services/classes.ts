import { supabase } from '@/lib/supabase';
import type { Class, Subject, Teacher, LectureTiming } from '@/types';

// --- Classes ---
export async function getClasses(): Promise<Class[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Class[];
}

export async function getClassById(id: string): Promise<Class | null> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Class;
}

export async function createClass(classData: Omit<Class, 'id' | 'created_at'>): Promise<Class> {
  const { data, error } = await supabase
    .from('classes')
    .insert(classData)
    .select()
    .single();

  if (error) throw error;
  return data as Class;
}

export async function updateClass(id: string, updates: Partial<Omit<Class, 'id' | 'created_at'>>): Promise<Class> {
  const { data, error } = await supabase
    .from('classes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Class;
}

// --- Subjects ---
export async function getSubjectsByClass(classId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('class_id', classId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Subject[];
}

export async function createSubject(subject: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .insert(subject)
    .select()
    .single();

  if (error) throw error;
  return data as Subject;
}

export async function updateSubject(id: string, updates: Partial<Omit<Subject, 'id' | 'created_at'>>): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Subject;
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// --- Teachers ---
export async function getTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data as Teacher[];
}

export async function createTeacher(teacher: Omit<Teacher, 'id' | 'created_at'>): Promise<Teacher> {
  const { data, error } = await supabase
    .from('teachers')
    .insert(teacher)
    .select()
    .single();

  if (error) throw error;
  return data as Teacher;
}

// --- Lecture Timings ---
export async function getLectureTimings(classId: string): Promise<LectureTiming[]> {
  const { data, error } = await supabase
    .from('lecture_timings')
    .select('*')
    .eq('class_id', classId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data as LectureTiming[];
}

export async function createLectureTiming(timing: Omit<LectureTiming, 'id'>): Promise<LectureTiming> {
  const { data, error } = await supabase
    .from('lecture_timings')
    .insert(timing)
    .select()
    .single();

  if (error) throw error;
  return data as LectureTiming;
}

export async function deleteLectureTiming(id: string): Promise<void> {
  const { error } = await supabase
    .from('lecture_timings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
