import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import AppShell from '@/components/AppShell';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Use admin client (bypasses RLS) so broken policies can't block this check
  const client = supabaseAdmin ?? supabase;
  const { data: profile } = await client
    .from('profiles')
    .select('role, is_admin')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  if (profile.is_admin || profile.role === 'admin') {
    redirect('/admin');
  }

  return <AppShell />;
}
