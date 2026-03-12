import { createClient } from '@supabase/supabase-js';

// Fallbacks allow build to succeed without env vars; real values required at runtime
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL     ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'
);
