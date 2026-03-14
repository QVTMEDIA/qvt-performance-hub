import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? 'https://placeholder.supabase.co';
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key';

// Browser client — used in client components (auth + RLS-gated data)
export const supabase = createBrowserClient(SUPABASE_URL, ANON_KEY);

// Admin client — server-side only, bypasses RLS entirely.
// SUPABASE_SERVICE_ROLE_KEY is undefined on the client (not NEXT_PUBLIC_),
// so this is null in the browser and only non-null in server components / API routes.
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
