import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import AppShell from '@/components/AppShell';

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', user.id)
        .single();

      if (profile?.is_admin || profile?.role === 'admin') {
        redirect('/admin');
      }
    }
  } catch {
    // Profile check failed — fall through to AppShell (has its own client-side check)
  }

  return <AppShell />;
}
