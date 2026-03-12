import { supabase } from '@/lib/supabase';
import { Role } from '@/types';

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  jobTitle?: string;
  department?: string;
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;

  return {
    id:         data.id,
    fullName:   data.full_name ?? '',
    email:      data.email    ?? user.email ?? '',
    role:       data.role     as Role,
    jobTitle:   data.job_title   ?? undefined,
    department: data.department  ?? undefined,
  };
}
