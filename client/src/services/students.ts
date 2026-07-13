import { supabase } from '@/lib/supabase';
import type { Student, StudentFormData } from '@/types';

export async function getStudents(classId?: string): Promise<Student[]> {
  let query = supabase
    .from('students')
    .select('*')
    .order('roll_number', { ascending: true });

  if (classId) {
    query = query.eq('class_id', classId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Student[];
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Student;
}

export async function createStudent(
  student: StudentFormData,
  classId: string
): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .insert({
      ...student,
      status: student.status || 'active',
      class_id: classId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Student;
}

export async function updateStudent(
  id: string,
  updates: Partial<StudentFormData>
): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Student;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function importStudents(
  students: StudentFormData[],
  classId: string
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;

  const insertData = students.map((s) => ({
    ...s,
    status: s.status || 'active',
    class_id: classId,
  }));

  const chunks = [];
  for (let i = 0; i < insertData.length; i += 50) {
    chunks.push(insertData.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    const { error } = await supabase.from('students').insert(chunk);
    if (error) {
      errors.push(error.message);
    } else {
      imported += chunk.length;
    }
  }

  return { imported, errors };
}

export async function searchStudents(
  query: string,
  classId?: string
): Promise<Student[]> {
  let searchQuery = supabase
    .from('students')
    .select('*')
    .or(`full_name.ilike.%${query}%,roll_number.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('roll_number', { ascending: true });

  if (classId) {
    searchQuery = searchQuery.eq('class_id', classId);
  }

  const { data, error } = await searchQuery;
  if (error) throw error;
  return data as Student[];
}
