import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Profile } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const client = supabaseAdmin ?? supabase;
  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin && profile?.role !== 'admin') {
    redirect('/');
  }

  const adminProfile: Profile = {
    id:         profile.id,
    fullName:   profile.full_name  ?? '',
    email:      profile.email      ?? user.email ?? '',
    role:       'admin',
    jobTitle:   profile.job_title  ?? undefined,
    department: profile.department ?? undefined,
    isAdmin:    true,
  };

  return <AdminShell profile={adminProfile} />;
}
