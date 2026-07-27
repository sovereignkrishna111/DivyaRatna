import { supabase } from '../../lib/supabase';

export async function fetchStudents() {
  const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchTeachers() {
  const { data, error } = await supabase.from('teachers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchStaff() {
  const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchEvents() {
  const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function countAll() {
  const [students, teachers, staff] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase.from('staff').select('*', { count: 'exact', head: true }),
  ]);
  return {
    students: students.count || 0,
    teachers: teachers.count || 0,
    staff: staff.count || 0,
  };
}
